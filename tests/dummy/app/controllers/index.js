import Ember from 'ember';
import filterBy from '../computeds/filter-by';
import shout from '../computeds/shout';

const { A, Object: EmberObject } = Ember;

function createPerso(name, isActive, isAdmin, isBlocked) {
  return EmberObject.extend({
    shoutedName: shout('name')
  }).create({
    name,
    isActive,
    isAdmin,
    isBlocked
  });
}

export default Ember.Controller.extend({
  queryParams: ['filter'],
  filter: 'isActive',

  users: A([
    createPerso('Peter', true, true, false),
    createPerso('Paul', true, false, false),
    createPerso('Mary', false, false, true)
  ]),

  filteredUsers: filterBy('users', 'filter'),

  actions: {
    toggle(user, property) {
      user.toggleProperty(property);
    }
  }
});
