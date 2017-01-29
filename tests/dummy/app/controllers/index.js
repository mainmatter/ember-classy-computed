import Ember from 'ember';
import filterBy from '../computeds/filter-by';
import shout from '../computeds/shout';
import serviceBased from '../computeds/service-based';

const { A, Object: EmberObject } = Ember;

function createPerson(name, isActive, isAdmin, isBlocked) {
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
    createPerson('Peter', true, true, false),
    createPerson('Paul', true, false, false),
    createPerson('Mary', false, false, true)
  ]),

  filteredUsers: filterBy('users', 'filter'),

  serviceState: serviceBased(),

  actions: {
    toggle(user, property) {
      user.toggleProperty(property);
    }
  }
});
