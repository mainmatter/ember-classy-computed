import Ember from 'ember';
import filterBy from '../computeds/filter-by';
import shout from '../computeds/shout';
import serviceBased from '../computeds/service-based';

const { computed, A, Object: EmberObject, getOwner } = Ember;

function createPerson(owner, name, isActive, isAdmin, isBlocked) {
  return EmberObject.extend({
    shoutedName: shout('name')
  }).create(owner.ownerInjection(), {
    name,
    isActive,
    isAdmin,
    isBlocked
  });
}

export default Ember.Controller.extend({
  queryParams: ['filter'],
  filter: 'isActive',

  users: computed(function() {
    let owner = getOwner(this);
    return A([
      createPerson(owner, 'Peter', true, true, false),
      createPerson(owner, 'Paul', true, false, false),
      createPerson(owner, 'Mary', false, false, true)
    ]);
  }),

  filteredUsers: filterBy('users', 'filter'),

  serviceState: serviceBased(),

  actions: {
    toggle(user, property) {
      user.toggleProperty(property);
    }
  }
});
