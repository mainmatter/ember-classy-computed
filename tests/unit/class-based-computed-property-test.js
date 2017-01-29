import Ember from 'ember';
import { module } from 'qunit';
import { test } from 'ember-qunit';
import ClassBasedComputedProperty from 'ember-class-based-cps';

const { Object: EmberObject, observer, computed: { filter }, defineProperty, A } = Ember;

const TestProperty = ClassBasedComputedProperty.extend({
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

const macro = ClassBasedComputedProperty.property(TestProperty);

const TestClass = EmberObject.extend({
  filterBy: 'isActive',
  filteredUsers: macro('users', 'filterBy')
});

let testObject;

module('ClassBasedComputedProperty', {
  beforeEach() {
    testObject = TestClass.create({
      users: A([
        EmberObject.create({ name: 'a', isActive: true, isAdmin: false }),
        EmberObject.create({ name: 'b', isActive: false, isAdmin: true })
      ])
    });
  }
});

test('invalidate calls notifyPropertyChange with the key on the context', function(assert) {
  let property = ClassBasedComputedProperty.create({
    _context: {
      notifyPropertyChange() {
        assert.ok(true);
      }
    },
    _key: 'someProperty'
  });

  property.invalidate();
});

test('ClassBasedComputedProperty.property returns a computed property macro', function(assert) {
  assert.ok(ClassBasedComputedProperty.property(TestProperty)() instanceof Ember.ComputedProperty);
});

test("the computed property returns the result of the class based property instance's computed method", function(assert) {
  assert.deepEqual(testObject.get('filteredUsers').mapBy('name'), ['a']);
});

test('the class based property instance can invalidate itself on changes of dependencies not listed in the dependent keys', function(assert) {
  testObject.get('users').objectAt(0).set('isActive', false);

  assert.deepEqual(testObject.get('filteredUsers').mapBy('name'), []);
});

test('it keeps separate class based property instances separate properties on the context', function(assert) {
  let otherTestObject = TestClass.create({
    users: A([
      EmberObject.create({ name: 'c', isActive: true, isAdmin: false }),
      EmberObject.create({ name: 'd', isActive: false, isAdmin: true })
    ]),
  });

  assert.deepEqual(otherTestObject.get('filteredUsers').mapBy('name'), ['c']);
  assert.deepEqual(testObject.get('filteredUsers').mapBy('name'), ['a']);

  otherTestObject.get('users').objectAt(0).set('isActive', false);

  assert.deepEqual(otherTestObject.get('filteredUsers').mapBy('name'), []);
  assert.deepEqual(testObject.get('filteredUsers').mapBy('name'), ['a']);
});
