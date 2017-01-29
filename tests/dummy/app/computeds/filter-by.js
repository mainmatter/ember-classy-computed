import Ember from 'ember';
import ClassBasedComputedProperty from 'ember-class-based-cps';

const { observer, computed: { filter }, defineProperty } = Ember;

const DynamicFilterByComputed = ClassBasedComputedProperty.extend({
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

export default ClassBasedComputedProperty.property(DynamicFilterByComputed);
