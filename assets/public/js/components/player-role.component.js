'use strict';

parasails.registerComponent('player-role', {
  props: {
    role: {
      type: Number,
      default: 0
    }
  },
  computed: {
    roleLetter: function roleLetter() {
      return ['', 'P', 'D', 'C', 'A'][this.role];
    }
  },
  template: '<span class="player-role" :class="\'player-role--\' + this.role">{{ roleLetter }}</span>'
});
