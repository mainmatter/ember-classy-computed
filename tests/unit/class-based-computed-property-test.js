import { module } from 'qunit';
import { test } from 'ember-qunit';
import { ClassBasedComputedProperty } from 'ember-class-based-cps';

module('ClassBasedComputedProperty');

test('invalidate calls notifyPropertyChange with the key on the context', function(assert) {
  let macaron = ClassBasedComputedProperty.create({
    _context: {
      notifyPropertyChange() {
        assert.ok(true);
      }
    },
    _key: 'someProperty'
  });

  macaron.invalidate();
});
