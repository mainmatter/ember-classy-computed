import Ember from 'ember';
import filterBy from '../computeds/filter-by';
import shout from '../computeds/shout';

const {
  computed,
  computed: { or },
  Object: EmberObject,
  A,
  run: { next },
  getOwner,
  Evented,
  RSVP
} = Ember;

const User = EmberObject.extend({
  shoutedNameClassyComputed: shout('name'),
  shoutedNameRegular: computed('name', function() {
    return `${this.get('name')}!!1!ELF!!`;
  })
});

export default Ember.Component.extend(Evented, {
  filter: 'isActive',

  users: computed(function() {
    return A([]);
  }),

  filteredUsers: filterBy('users', 'filter'),

  _reset() {
    this.set('result', null);
    this.get('users').clear();
  },

  _fillUsers(count) {
    for (let i = 0; i < count; i++) {
      let isActive = Math.random() < 0.5;
      let isBlocked = Math.random() < 0.5;
      this.get('users').pushObject(User.create({ name: `User ${i}`, isActive, isBlocked }));
    }
  },

  _updateUsers(iterations, iteration = 0) {
    let index = Math.floor(Math.random() * (iterations - 1));
    let isActive = Math.random() < 0.5;
    this.get('users').objectAt(index).set('isActive', isActive);

    if (iteration <= iterations) {
      next(() => {
        this._updateUsers(iterations, ++iteration);
      });
    } else {
      this.trigger('_done');
    }
  },

  _toggleFilterProperty(iterations, iteration = 0) {
    let property = (iteration % 2 === 0) ? 'isBlocked' : 'isActive';
    this.set('filter', property);

    if (iteration <= iterations) {
      next(() => {
        this._toggleFilterProperty(iterations, ++iteration);
      });
    } else {
      this.trigger('_done');
    }
  },

  _runBenchmark(name, prepare, run) {
    this._reset();
    this.set('isRunning', true);

    next(() => {
      prepare().then((preparation) => {
        let start = performance.now();
        run(preparation).then(() => {
          let duration = performance.now() - start;
          let result = `${name}: ${duration}`;

          this.set('result', result);
          this.setProperties({
            isRunning: false,
            renderClassyComputed: false,
            renderComposableHelpers: false
          });
        });
      });
    });
  },

  actions: {
    runTrivialPropertyAccessWithoutClassyComputed() {
      this._runBenchmark('100000 recomputations with native CPs', () => {
        let owner = getOwner(this);
        return RSVP.resolve(User.create(owner.ownerInjection(), { name: 'some user' }));
      }, (user) => {
        for (let i = 0; i < 100000; i++) {
          let name = Math.random().toString(36).substring(7);
          user.set('name', name);
          user.get('shoutedNameRegular');
        }
        return RSVP.resolve();
      });
    },

    runTrivialPropertyAccessWithClassyComputed() {
      this._runBenchmark('100000 recomputations with ember-classy-computed', () => {
        let owner = getOwner(this);
        return RSVP.resolve(User.create(owner.ownerInjection(), { name: 'some user' }));
      }, (user) => {
        for (let i = 0; i < 100000; i++) {
          let name = Math.random().toString(36).substring(7);
          user.set('name', name);
          user.get('shoutedNameClassyComputed');
        }
        return RSVP.resolve();
      });
    },

    runInitialRenderWithClassyComputed() {
      this._runBenchmark('Initial render of 1000 users with ember-classy-computed', () => {
        this.set('renderClassyComputed', true);
        this._fillUsers(1000);
        return RSVP.resolve();
      }, () => {
        return new RSVP.Promise((resolve) => next(null, resolve));
      });
    },

    runInitialRenderWithComposableHelpers() {
      this._runBenchmark('Initial render of 1000 users with ember-composable-helpers', () => {
        this.set('renderComposableHelpers', true);
        this._fillUsers(1000);
        return RSVP.resolve();
      }, () => {
        return new RSVP.Promise((resolve) => next(null, resolve));
      });
    },

    runUpdatesWithClassyComputed() {
      this._runBenchmark('Random updates of 100 users with ember-classy-computed', () => {
        this.set('renderClassyComputed', true);
        this._fillUsers(100);
        return RSVP.resolve();
      }, () => {
        return new RSVP.Promise((resolve) => {
          this._updateUsers(100);
          this.one('_done', resolve);
        });
      });
    },

    runUpdatesWithComposableHelpers() {
      this._runBenchmark('Random updates of 100 users with ember-composable-helpers', () => {
        this.set('renderComposableHelpers', true);
        this._fillUsers(100);
        return RSVP.resolve();
      }, () => {
        return new RSVP.Promise((resolve) => {
          this._updateUsers(100);
          this.one('_done', resolve);
        });
      });
    },

    runFilterPropertyToggleWithClassyComputed() {
      this._runBenchmark('Observed property updates for 100 users with ember-classy-computed', () => {
        this.set('renderClassyComputed', true);
        this._fillUsers(100);
        return RSVP.resolve();
      }, () => {
        return new RSVP.Promise((resolve) => {
          this._toggleFilterProperty(100);
          this.one('_done', resolve);
        });
      });
    },

    runFilterPropertyToggleWithComposableHelpers() {
      this._runBenchmark('Observed property updates for 100 users with ember-composable-helpers', () => {
        this.set('renderComposableHelpers', true);
        this._fillUsers(100);
        return RSVP.resolve();
      }, () => {
        return new RSVP.Promise((resolve) => {
          this._toggleFilterProperty(100);
          this.one('_done', resolve);
        });
      });
    }
  }
});
