import Ember from 'ember';

const { Object: EmberObject, computed, A, isNone } = Ember;

const MACROS = new WeakMap();

function findOrCreateMacaron(klass, context, key) {
  let klassMacarons = MACROS.get(context);
  if (isNone(klassMacarons)) {
    klassMacarons = {};
    MACROS.set(context, klassMacarons);
  }

  let macaron;
  if (macaron = klassMacarons[key]) {
    return macaron;
  } else {
    macaron = klass.create({
      _key: key,
      _context: context
    });

    klassMacarons[key] = macaron;
    return macaron;
  }
}

export const ClassBasedComputedProperty = EmberObject.extend({
  _context: null,
  _key: null,

  invalidate() {
    this._context.notifyPropertyChange(this._key);
  },
});

export function wrap(klass) {
  return function(...dependencies) {
    return computed(...dependencies, function(key) {
      let macaron = findOrCreateMacaron(klass, this, key);

      let values = A(dependencies).map((dep) => this.get(dep));
      return macaron.compute(...values);
    });
  };
}
