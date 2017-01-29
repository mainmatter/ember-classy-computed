import Ember from 'ember';
import { Macaron, wrap } from 'ember-class-based-cps';

const { observer, computed: { filter }, defineProperty } = Ember;

const DynamicFilterByComputed = Macaron.extend({
  contentDidChange: observer('content', function() {
    this.invalidate();
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
