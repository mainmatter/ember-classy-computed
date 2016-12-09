import Ember from 'ember';

const { Object: EmberObject, computed, A } = Ember;

export const Macaron = EmberObject.extend({
  context: null,
  key: null,

  recompute() {
    this.get('context').notifyPropertyChange(this.get('key'));
  },
});

export function wrap(klass) {
  return function(...dependencies) {
    let macaron = klass.create();

    return computed(...dependencies, function(key) {
      macaron.setProperties({ context: this, key});

      let values = A(dependencies).map((dep) => this.get(dep));
      return macaron.compute(...values);
    });
  };
}
