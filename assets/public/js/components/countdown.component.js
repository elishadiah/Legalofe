'use strict';

parasails.registerComponent('count-down', {
  props: {
    deadline: {
      type: String,
      default: null
    }
  },
  data: function data() {
    return {
      canSendStanding: false,
      remaining: null
    };
  },
  mounted: function mounted() {
    var _this = this;

    if (this.deadline) {
      var countDownDate = new Date(this.deadline).getTime();

      // Update the count down every 1 second
      var countDownTimer = setInterval(function () {
        // Get today's date and time
        var now = new Date().getTime();

        // Find the distance between now and the count down date
        var distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor(distance % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
        var minutes = Math.floor(distance % (1000 * 60 * 60) / (1000 * 60));
        var seconds = Math.floor(distance % (1000 * 60) / 1000);

        // Display the result in the element with id="demo"
        _this.remaining = days + ' : ' + hours + ' : ' + minutes + ' : ' + seconds;
        _this.canSendStanding = true;

        // If the count down is finished, write some text
        if (distance < 0) {
          clearInterval(countDownTimer);
          _this.remaining = 'TEMPO SCADUTO';
          _this.canSendStanding = false;
        }
      }, 1000);
    } else {
      this.remaining = 'NESSUN INCONTRO';
      this.canSendStanding = false;
    }
  },

  template: '\n<div class="box">\n  <div>\n    <div class="has-text-centered">Schiera la tua formazione entro</div>\n    <div class="has-text-centered">{{ remaining }}</div>\n  </div>\n</div>'
});
