import Ember from 'ember';
import ClassBasedComputedProperty from 'ember-classy-computed';

const { inject: { service }, observer } = Ember;

const ServiceBasedComputed = ClassBasedComputedProperty.extend({
  stateKeeper: service(),

  serviceStateDidChange: observer('stateKeeper.currentState', function() {
    this.invalidate();
  }),

  compute() {
    return this.get('stateKeeper.currentState');
  }
});

export default ClassBasedComputedProperty.property(ServiceBasedComputed);
