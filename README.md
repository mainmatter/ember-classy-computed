# ember-class-based-cps

ember-class-based-cps introduce a mechanism for __class based computed
properties__ which essentially enables keeping state in computed properties
(as opposed to normal computed properties which are stateless).

Keeping that state *inside* of the computed property instead of in the instance
of the class it is defined on enables new kinds of computed property macros
that are currently hard to implement:

* computed property macros can use services without having to inject the
  service into the class they are defined on
* computed property macros with dynamic dependent keys
* computed property macros that depend on external invalidation triggers
  other than those expressible as dependent keys, e.g. events

Class based computed properties are essentially equivalent to
[class based helpers](http://guides.emberjs.com/v2.11.0/templates/writing-helpers/#toc_class-based-helpers).

## Use Case

Filtering a collection by an attribute is easy:

```js
activeUsers: Ember.computed('users.@each.isActive', function() {
  return users.filterBy('isActive')
})
```

This will filter the `users` collection by the `isActive` attribute so that
`activeUsers` only returns users for which that attribute is `true`. This
computed property depends on each user's `isActive` property obviously.

__What if the property that the users are to be filtered by might change
though?__ In that case you might write sth. like this:

```js
activeUsers: Ember.computed('filter', function() {
  return users.filterBy(this.get('filter'))
})
```

This now filter the `users` by whatever property name is returned by `filter`.
The problem with this is that the `activeUsers` property does not depend on any
of the individual user's properties anymore so that it would not get recomputed
when any of these user's properties change. There is also no way to express the
fact that `activeUsers` depends on `users.@each.isActive` when `filter` is
`'isActive'` and on `users.@each.isAdmin` when `filter` is `'isAdmin'`.

ember-class-based-cps makes defining a __computed property macro with dynamic
dependent keys__ easy be providing a class that the property's logic is
encapsulated in and that can observe the `filter` property and redefine the
computed property with the correct dependent keys when it changes: What this
allows is sth. like this:

```js
import filterByProperty from 'app/computeds/filter-by';

…

activeUsers: filterByProperty('users' 'filter')
```

The logic for the `filterByProperty` macro is encapsulated in a class then:

```js
// app/computeds/filter-by.js
import Ember from 'ember';
import { ClassBasedComputedProperty } from 'ember-class-based-cps';

const { observer, computed: { filter }, defineProperty } = Ember;

const DynamicFilterByComputed = ClassBasedComputedProperty.extend({
  contentDidChange: observer('content', function() {
    this.invalidate(); // This method is provided by the ClassBasedComputedProperty
                       // base class and invalidates the computed property so that
                       // it will get recomputed on the next access.
  }),

  filterPropertyDidChange: observer('filterProperty', function() {
    let filterProperty = this.get('filterProperty');
    let property = filter(`collection.@each.${filterProperty}`, (item) => item.get(filterProperty));
    defineProperty(this, 'content', property);
  }),

  compute(collection, filterProperty) {
    this.set('collection', collection);
    this.set('filterProperty', filterProperty);

    return this.get('content');
  }
});

export default ClassBasedComputedProperty.property(DynamicFilterByComputed);
```

Here the computed property's logic is __completely self-contained__ in the
`DynamicFilterByComputed` class so that it can easily be used via the
`filterByProperty` while still ensuring correct dependent keys even when
the dynamic filter property changes.

## Installation

`ember install ember-class-based-cps`

## License

ember-class-based-cps is developed by and &copy;
[simplabs GmbH](http://simplabs.com) and contributors. It is released under the
[MIT License](LICENSE).
