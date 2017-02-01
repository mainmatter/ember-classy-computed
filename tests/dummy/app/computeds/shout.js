import Ember from 'ember';

const { computed } = Ember;

export default function(propertyName) {
  return computed(propertyName, function() {
    return `${this.get(propertyName).toUpperCase()}!!1!ELF!!`;
  });
}
