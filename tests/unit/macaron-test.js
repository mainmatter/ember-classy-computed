import { module } from 'qunit';
import { test } from 'ember-qunit';
import { Macaron } from 'ember-macarons';

module('Macaron');

test('invalidate calls notifyPropertyChange with the key on the context', function(assert) {
  let macaron = Macaron.create({
    _context: {
      notifyPropertyChange() {
        assert.ok(true);
      }
    },
    _key: 'someProperty'
  });

  macaron.invalidate();
});
