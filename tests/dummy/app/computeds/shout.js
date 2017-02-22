import ClassBasedComputedProperty from 'ember-classy-computed';

const ShoutComputed = ClassBasedComputedProperty.extend({
  compute(string) {
    return `${string}!!1!ELF!!`;
  }
});

export default ClassBasedComputedProperty.property(ShoutComputed);
