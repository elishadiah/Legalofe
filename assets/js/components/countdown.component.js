parasails.registerComponent('count-down', {
  props: {
    deadline: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      canSendStanding: false,
      remaining: null
    }
  },
  mounted () {
    if (this.deadline) {
      const countDownDate = new Date(this.deadline).getTime()

      // Update the count down every 1 second
      const countDownTimer = setInterval(() => {
        // Get today's date and time
        const now = new Date().getTime()

        // Find the distance between now and the count down date
        const distance = countDownDate - now

        // Time calculations for days, hours, minutes and seconds
        const days = Math.floor(distance / (1000 * 60 * 60 * 24))
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)

        // Display the result in the element with id="demo"
        this.remaining = `${days} : ${hours} : ${minutes} : ${seconds}`
        this.canSendStanding = true

        // If the count down is finished, write some text
        if (distance < 0) {
          clearInterval(countDownTimer)
          this.remaining = 'TEMPO SCADUTO'
          this.canSendStanding = false
        }
      }, 1000)
    } else {
      this.remaining = 'NESSUN INCONTRO'
      this.canSendStanding = false
    }
  },
  template: `
<div class="box">
  <div>
    <div class="has-text-centered">Schiera la tua formazione entro</div>
    <div class="has-text-centered">{{ remaining }}</div>
  </div>
</div>`
})
