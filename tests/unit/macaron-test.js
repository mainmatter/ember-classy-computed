import { module } from 'qunit';
import { test } from 'ember-qunit';
import { Macaron } from 'ember-macarons';

module('Macaron');

test('recompute calls notifyPropertyChange with the key on the context', function(assert) {
  let macaron = Macaron.create({
    context: {
      notifyPropertyChange() {
        assert.ok(true);
      }
    },
    key: 'someProperty'
  });

  macaron.recompute();
});
