import Ember from 'ember';
import { module } from 'qunit';
import { test } from 'ember-qunit';
import { ClassBasedComputedProperty, wrap } from 'ember-class-based-cps';

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

const macro = wrap(TestProperty);

const TestClass = EmberObject.extend({
  filterBy: 'isActive',
  filteredUsers: macro('users', 'filterBy')
});

let testObject;

module('wrap', {
  beforeEach() {
    testObject = TestClass.create({
      users: A([
        EmberObject.create({ name: 'a', isActive: true, isAdmin: false }),
        EmberObject.create({ name: 'b', isActive: false, isAdmin: true })
      ])
    });
  }
});

test('wrap returns a computed property macro', function(assert) {
  assert.ok(wrap(TestProperty)() instanceof Ember.ComputedProperty);
});

test("the computed returns the result of the macaron's computed method", function(assert) {
  assert.deepEqual(testObject.get('filteredUsers').mapBy('name'), ['a']);
});

test('the macaron can invalidate itself on changes of dependencies not listed in the dependent keys', function(assert) {
  testObject.get('users').objectAt(0).set('isActive', false);

  assert.deepEqual(testObject.get('filteredUsers').mapBy('name'), []);
});

test('it keeps the computed property separate for separate instances', function(assert) {
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
