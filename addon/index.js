import Ember from 'ember';
import WeakMap from 'ember-weakmap';

const { Object: EmberObject, computed, A, isNone, getOwner } = Ember;

const PROPERTIES = new WeakMap();

function findOrCreatePropertyInstance(propertyClass, context, key) {
  let propertiesForContext = PROPERTIES.get(context);
  if (isNone(propertiesForContext)) {
    propertiesForContext = {};
    PROPERTIES.set(context, propertiesForContext);
  }

  let property = propertiesForContext[key];
  if (property && property instanceof propertyClass) {
    return property;
  }

  let owner = getOwner(context);
  property = propertyClass.create(owner.ownerInjection(), {
    _key: key,
    _context: context
  });

  propertiesForContext[key] = property;

  if (context instanceof Ember.Component) {
    // in case component would be destroyed
    // we need to destroy computed property as well
    context.one('willDestroyElement', () => property.destroy());
  }

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
      const generatedComputedProperty = computed(...dependencies, function(key) {
        let property = findOrCreatePropertyInstance(klass, this, key);

        const isComputedPropertyOrphaned = () => {
          //in case new computed property would be generated under the same key
          //of context object
          if(this[key] !== generatedComputedProperty) {
            //we need to destroy previous one
            property.destroy();
            //also there is no longer need to check it
            this.removeObserver(key, isComputedPropertyOrphaned);
          }
        };

        this.addObserver(key, isComputedPropertyOrphaned);

        let values = A(dependencies).map((dep) => this.get(dep));
        return property.compute(...values);
      });

      return generatedComputedProperty;
    };
  }
});

export default ClassBasedComputedProperty;
