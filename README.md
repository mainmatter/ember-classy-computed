# ember-classy-computed

ember-classy-computed introduce a mechanism for __class based computed
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

An example use case for a class based computed property is a macro that creates
a computed property with dynamic dependent keys that cannot be know upfront.

Defining a computed property that filters a collection property by the value of
an attribute of each element is as easy as

```js
filteredUsers: Ember.computed('users.@each.isActive', function() {
  return users.filterBy('isActive')
})
```

This will filter the `users` collection by the `isActive` attribute of each
user so that `filteredUsers` only includes users for which that attribute is
`true`. This computed property depends on each user's `isActive` property
obviously.

__What if the property that the users are to be filtered by might change
though?__ In that case you might write sth. like this:

```js
filteredUsers: Ember.computed('filter', function() {
  return users.filterBy(this.get('filter'))
})
```

This now filter the `users` by whatever property name is returned by `filter`.
The problem with this is that the `filteredUsers` property does not depend on any
of the individual user's properties anymore so that it would not be recomputed
when any of these user's properties change. There is also no way to express the
fact that `filteredUsers` depends on `users.@each.isActive` when `filter` is
`'isActive'` and on `users.@each.isAdmin` when `filter` is `'isAdmin'`.

Typicall this case would be solved by defining an observer on the context
object's `filter` property and whenever that changes redefining the
`filteredUsers` computed property with the correct dependent keys for the current
value of `filter` (an alternative solution would be to override the `filter`
property's `set` method and redefine `filteredUsers` there).

That would make it impossible to reuse the implementation though (except in a
mixin which leads to other problems though). ember-classy-computed' mechanism
for class based computed properties makes it possible to reuse that
implementation- by providing a context for the computed property itself that
the observer etc. can be defined on. This allows something like:

```js
import filterByProperty from 'app/computeds/filter-by';

…

filteredUsers: filterByProperty('users' 'filter')
```

The logic for the `filterByProperty` macro is encapsulated in the
`DynamicFilterByComputed` class:

```js
// app/computeds/filter-by.js
import Ember from 'ember';
import ClassBasedComputedProperty from 'ember-classy-computed';

const { observer, computed: { filter }, defineProperty } = Ember;

const DynamicFilterByComputed = ClassBasedComputedProperty.extend({
  filterPropertyDidChange: observer('filterProperty', function() {
    let filterProperty = this.get('filterProperty');
    let property = filter(`collection.@each.${filterProperty}`, (item) => item.get(filterProperty));
    defineProperty(this, 'content', property);

    // This method is provided by the ClassBasedComputedProperty
    // base class and invalidates the computed property so that
    // it will get recomputed on the next access.
    this.invalidate();
  }),

  // This method is called whenever the computed property on the context object
  // is recomputed. The same lazy recomputation behavior as for regular computed
  // properties applies here of course. The method receives the current values
  // of its dependent properties as its arguments.
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
`filterByProperty` macro while still ensuring correct dependent keys even when
the dynamic filter property changes.

## Installation

`ember install ember-classy-computed`

## License

ember-classy-computed is developed by and &copy;
[simplabs GmbH](http://simplabs.com) and contributors. It is released under the
[MIT License](LICENSE).
