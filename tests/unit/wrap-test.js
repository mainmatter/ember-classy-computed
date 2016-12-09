import Ember from 'ember';
import { module } from 'qunit';
import { test } from 'ember-qunit';
import { Macaron, wrap } from 'ember-macarons';

const { Object: EmberObject } = Ember;

const TestMacaron = Macaron.extend({
  compute(a, b) {
    return `${a} ${b}`;
  }
});

const macro = wrap(TestMacaron);

const TestClass = EmberObject.extend({
  prop: macro('a', 'b')
});

let testObject;

module('wrap', {
  beforeEach() {
    testObject = TestClass.create({
      a: 'value a',
      b: 'value b'
    });
  }
});

test('wrap returns a computed property macro', function(assert) {
  assert.ok(testObject.prop instanceof Ember.ComputedProperty);
});

test("the computed property calls the macaron's function with the values of the respective attributes", function(assert) {
  assert.equal(testObject.get('prop'), 'value a value b');
});

test('the computed property updates correctly', function(assert) {
  assert.equal(testObject.get('prop'), 'value a value b');

  testObject.set('a', 'value c');

  assert.equal(testObject.get('prop'), 'value c value b');

  testObject.set('b', 'value d');

  assert.equal(testObject.get('prop'), 'value c value d');
});

test("the computed property sets the macaron's context and key attributes", function(assert) {
  let otherTestObject;
  let OtherTestMacaron = Macaron.extend({
    setProperties(props) {
      assert.equal(props.key, 'prop');
      assert.deepEqual(props.context, otherTestObject);
    },
    compute() {}
  });

  let otherMacro = wrap(OtherTestMacaron);

  let OtherTestClass = EmberObject.extend({
    prop: otherMacro()
  });

  otherTestObject = OtherTestClass.create();
  otherTestObject.get('prop');
});
