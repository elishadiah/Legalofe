parasails.registerPage('new-campionato', {
  data: {
    allTeams: [],
    fantaGiornate: [],
    fantaIncontri: [],
    teams: []
  },
  async mounted () {
    const response = await axios.get('/team')
    this.allTeams = response.data
  },
  methods: {
    async fetchCalendar () {
      const html = await axios.get('https://www.corrieredellosport.it/live/calendario-serie-a.html')

      const giornate = $($.parseHTML(html.data)).find('.main-column > table')

      giornate.each((i, el) => {
        const dates = $(el).find('tbody tr:first-child')

        this.fantaGiornate.push({
          date: dates.find('th').eq(0).text().trim(),
          daySerieA: i + 1
        })

        this.fantaGiornate.push({
          date: dates.find('th').eq(2).text().trim(),
          daySerieA: giornate.length + i + 1
        })

        this.fantaGiornate = _.sortBy(this.fantaGiornate, 'daySerieA')
      })
    },
    createMatches () {
      for (let i = 0; i < this.teams.length; i ++) {
        for (let j = 0; j < this.teams.length; j ++) {
          if (i === j) { continue }

          this.fantaIncontri.push({
            teamHome: this.teams[i].id,
            teamAway: this.teams[j].id
          })

          this.fantaIncontri.push({
            teamHome: this.teams[j].id,
            teamAway: this.teams[i].id
          })
        }
      }
    },
    async onStepChange (step) {
      if (step === 1) {
        await this.fetchCalendar()
        this.createMatches()
      }
    }
  }
})