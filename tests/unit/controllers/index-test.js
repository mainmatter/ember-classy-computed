import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';

const { A } = Ember;

moduleFor('controller:index', 'Unit | Controller | index', {
  needs: ['service:state-keeper']
});

test('class based computed properties can use services', function(assert) {
  let controller = this.subject();

  assert.equal(controller.get('serviceState'), 1);
});

test("the computed property returns the result of the class based property instance's computed method", function(assert) {
  let controller = this.subject({
    filter: 'isActive',
    users: A([
      Ember.Object.create({ name: 'Peter', isActive: true }),
      Ember.Object.create({ name: 'Paul', isActive: false })
    ])
  });

  assert.deepEqual(controller.get('filteredUsers').mapBy('name'), ['Peter']);
});

test('the class based property instance can invalidate itself on changes of dependencies not listed in the dependent keys', function(assert) {
  let controller = this.subject({
    filter: 'isActive',
    users: A([
      Ember.Object.create({ name: 'Peter', isActive: true }),
      Ember.Object.create({ name: 'Paul', isActive: false })
    ])
  });

  assert.deepEqual(controller.get('filteredUsers').mapBy('name'), ['Peter']);

  controller.get('users').pushObject(Ember.Object.create({ name: 'Mary', isActive: true }));

  assert.deepEqual(controller.get('filteredUsers').mapBy('name'), ['Peter', 'Mary']);

  controller.get('users').setEach('isActive', true);

  assert.deepEqual(controller.get('filteredUsers').mapBy('name'), ['Peter', 'Paul', 'Mary']);
});
