import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';

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
    users: [
      Ember.Object.create({ name: 'Peter', isActive: true }),
      Ember.Object.create({ name: 'Paul', isActive: false })
    ]
  });

  assert.deepEqual(controller.get('filteredUsers').mapBy('name'), ['Peter']);
});

test('the class based property instance can invalidate itself on changes of dependencies not listed in the dependent keys', function(assert) {
  let controller = this.subject({
    filter: 'isActive',
    users: [
      Ember.Object.create({ name: 'Peter', isActive: true }),
      Ember.Object.create({ name: 'Paul', isActive: false })
    ]
  });

  assert.deepEqual(controller.get('filteredUsers').mapBy('name'), ['Peter']);

  controller.set('users.1.isActive', true);

  assert.deepEqual(controller.get('filteredUsers').mapBy('name'), ['Peter', 'Paul']);
});
