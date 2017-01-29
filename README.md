# ember-macarons

ember-macarons enables __class based computed property macros__ which can for
example be used to support dynamic dependent keys.

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

ember-macarons makes defining a __computed property macro with dynamic
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
import { Macaron, wrap } from 'ember-macarons';

const { observer, computed: { filter }, defineProperty } = Ember;

const DynamicFilterByComputed = Macaron.extend({
  contentDidChange: observer('content', function() {
    this.invalidate(); // This method is provided by the Macaron base class and
                       // invalidates the computed property so that it will get
                       // recomputed on the next access.
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

export default wrap(DynamicFilterByComputed);
```

Here the computed property's logic is __completely self-contained__ in the
`DynamicFilterByComputed` class so that it can easily be used via the
`filterByProperty` while still ensuring correct dependent keys even when
the dynamic filter property changes.

## Installation

`ember install ember-macarons`

## License

ember-macarons is developed by and &copy;
[simplabs GmbH](http://simplabs.com) and contributors. It is released under the
[MIT License](LICENSE).
