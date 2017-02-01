import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import ClassBasedComputedProperty from 'ember-classy-computeds';

const { getOwner } = Ember;

// need to use moduleFor here so we have a way to get an owner from somewhere
moduleFor('controller:index', 'ClassBasedComputedProperty');

test('invalidate calls notifyPropertyChange with the key on the context', function(assert) {
  let property = ClassBasedComputedProperty.create({
    _context: {
      notifyPropertyChange(key) {
        assert.equal(key, 'someProperty');
      }
    },
    _key: 'someProperty'
  });

  property.invalidate();
});

test('ClassBasedComputedProperty.property returns a computed property macro', function(assert) {
  let PropertyClass = ClassBasedComputedProperty.extend();
  let propertyMacro = ClassBasedComputedProperty.property(PropertyClass);

  assert.ok(propertyMacro() instanceof Ember.ComputedProperty);
});

test('class based property instances are created lazily', function(assert) {
  let instances = 0;
  let PropertyClass = ClassBasedComputedProperty.extend({
    init() {
      this._super(...arguments);

      instances++;
    },

    compute() {
      return 'value';
    }
  });
  let propertyMacro = ClassBasedComputedProperty.property(PropertyClass);

  let TestClass = Ember.Object.extend({
    computedProperty: propertyMacro()
  });

  let owner = getOwner(this.subject());
  let testContext = TestClass.create(owner.ownerInjection());

  assert.equal(instances, 0, 'There is no instance of the computed property class when no property its used for has been accessed.');

  testContext.get('computedProperty');

  assert.equal(instances, 1, 'There is an instance of the computed property class when a property its used for has been accessed.');
});

test('it uses separate class based property instances for properties on separate contexts', function(assert) {
  let instances = 0;
  let PropertyClass = ClassBasedComputedProperty.extend({
    init() {
      this._super(...arguments);

      instances++;
    },

    compute() {
      return 'value';
    }
  });
  let propertyMacro = ClassBasedComputedProperty.property(PropertyClass);

  let TestClass = Ember.Object.extend({
    computedProperty: propertyMacro()
  });

  let owner = getOwner(this.subject());
  let testContextA = TestClass.create(owner.ownerInjection());
  let testContextB = TestClass.create(owner.ownerInjection());


  testContextA.get('computedProperty');
  testContextB.get('computedProperty');

  assert.equal(instances, 2, 'There are 2 instances for the class based property for 2 separate properties on 2 separate contexts.');
});

test('it uses separate class based property instances for separate properties on the same context', function(assert) {
  let instances = 0;
  let PropertyClass = ClassBasedComputedProperty.extend({
    init() {
      this._super(...arguments);

      instances++;
    },

    compute() {
      return 'value';
    }
  });
  let propertyMacro = ClassBasedComputedProperty.property(PropertyClass);

  let TestClass = Ember.Object.extend({
    computedPropertyA: propertyMacro(),
    computedPropertyB: propertyMacro()
  });

  let owner = getOwner(this.subject());
  let testContext = TestClass.create(owner.ownerInjection());

  testContext.get('computedPropertyA');
  testContext.get('computedPropertyB');

  assert.equal(instances, 2, 'There are 2 instances for the class based property for 2 separate properties on the same context.');
});
