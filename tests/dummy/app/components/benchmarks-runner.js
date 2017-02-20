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

  isRunning: or('isClassyComputedRunning', 'isComposableHelpersRunning', 'isBarebonesRunning'),

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

  _runBenchmark(flag, runner) {
    this._reset();
    this.set(flag, true);

    next(() => {
      runner().then((result) => {
        this.set('result', result);
        this.set(flag, false);
      });
    });
  },

  actions: {
    runTrivialPropertyAccessWithoutClassyComputed() {
      this._runBenchmark('isBarebonesRunning', () => {
        let owner = getOwner(this);
        let user = User.create(owner.ownerInjection(), { name: 'some user' });

        let start = performance.now();
        for (let i = 0; i < 100000; i++) {
          let name = Math.random().toString(36).substring(7);
          user.set('name', name);
          user.get('shoutedNameRegular');
        }
        let end = performance.now();

        return RSVP.resolve(`100000 trivial property recomputations: ${end - start} milliseconds.`);
      });
    },

    runTrivialPropertyAccessWithClassyComputed() {
      this._runBenchmark('isBarebonesRunning', () => {
        let owner = getOwner(this);
        let user = User.create(owner.ownerInjection(), { name: 'some user' });

        let start = performance.now();
        for (let i = 0; i < 100000; i++) {
          let name = Math.random().toString(36).substring(7);
          user.set('name', name);
          user.get('shoutedNameClassyComputed');
        }
        let end = performance.now();

        return RSVP.resolve(`100000 ember-classy-computed recomputations: ${end - start} milliseconds.`);
      });
    },

    runInitialRenderWithClassyComputed() {
      this._runBenchmark('isClassyComputedRunning', () => {
        this._fillUsers(1000);

        return new RSVP.Promise((resolve) => {
          let start = performance.now();
          next(() => {
            let end = performance.now();

            resolve(`Initial render of 1000 users with ember-classy-computed: ${end - start} milliseconds.`);
          });
        });
      });
    },

    runInitialRenderWithComposableHelpers() {
      this._runBenchmark('isClassyComputedRunning', () => {
        this._fillUsers(1000);

        return new RSVP.Promise((resolve) => {
          let start = performance.now();
          next(() => {
            let end = performance.now();

            resolve(`Initial render of 1000 users with ember-composable-helpers: ${end - start} milliseconds.`);
          });
        });
      });
    },

    runUpdatesWithClassyComputed() {
      this._runBenchmark('isClassyComputedRunning', () => {
        this._fillUsers(100);

        return new RSVP.Promise((resolve) => {
          let start = performance.now();
          this._updateUsers(100);
          this.one('_done', () => {
            let end = performance.now();

            resolve(`Random updates of 100 users with ember-classy-computed: ${end - start} milliseconds.`);
          });
        });
      });
    },

    runUpdatesWithComposableHelpers() {
      this._runBenchmark('isComposableHelpersRunning', () => {
        this._fillUsers(100);

        return new RSVP.Promise((resolve) => {
          let start = performance.now();
          this._updateUsers(100);
          this.one('_done', () => {
            let end = performance.now();

            resolve(`Random updates of 100 users with ember-composable-helpers: ${end - start} milliseconds.`);
          });
        });
      });
    },

    runFilterPropertyToggleWithClassyComputed() {
      this._runBenchmark('isClassyComputedRunning', () => {
        this._fillUsers(100);

        return new RSVP.Promise((resolve) => {
          let start = performance.now();
          this._toggleFilterProperty(100);
          this.one('_done', () => {
            let end = performance.now();

            resolve(`Toggling filter property for 100 users with ember-classy-computed: ${end - start} milliseconds.`);
          });
        });
      });
    },

    runFilterPropertyToggleWithComposableHelpers() {
      this._runBenchmark('isComposableHelpersRunning', () => {
        this._fillUsers(100);

        return new RSVP.Promise((resolve) => {
          let start = performance.now();
          this._toggleFilterProperty(100);
          this.one('_done', () => {
            let end = performance.now();

            resolve(`Toggling filter property for 100 users with ember-composable-helpers: ${end - start} milliseconds.`);
          });
        });
      });
    }
  }
});
