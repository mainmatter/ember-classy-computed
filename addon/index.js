import Ember from 'ember';

const { Object: EmberObject, computed, A, isNone, getOwner, WeakMap } = Ember;

const PROPERTIES = new WeakMap();

function findOrCreatePropertyInstance(propertyClass, context, key) {
  let propertiesForContext = PROPERTIES.get(context);
  if (isNone(propertiesForContext)) {
    propertiesForContext = {};
    PROPERTIES.set(context, propertiesForContext);
  }

  let property = propertiesForContext[key];
  if (property) {
    return property;
  }

  let owner = getOwner(context);
  property = propertyClass.create(owner.ownerInjection(), {
    _key: key,
    _context: context
  });

  propertiesForContext[key] = property;
  return property;
}

const ClassBasedComputedProperty = EmberObject.extend({
  _context: null,
  _key: null,

  invalidate() {
    this._context.notifyPropertyChange(this._key);
  },
});

ClassBasedComputedProperty.reopenClass({
  property(klass) {
    return function(...dependencies) {
      return computed(...dependencies, function(key) {
        let property = findOrCreatePropertyInstance(klass, this, key);

        let values = A(dependencies).map((dep) => this.get(dep));
        return property.compute(...values);
      });
    };
  }
});

export default ClassBasedComputedProperty;
