parasails.registerPage('admin-campionato', {
  filters: {
    fmtDate (dateString) {
      const MESI = [ 'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic' ]
      const GIORNI = [ 'Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab' ]

      const date = new Date(dateString)

      return `${GIORNI[date.getDay()]} ${date.getDate()} ${MESI[date.getMonth()]} ${date.getFullYear()}`
    }
  },
  data: {
    allFantaGiornate: [],
    calcDay: null,
    isDialogOpen: false,
    columns: [
      {
        field: 'day',
        label: 'Fanta Giornata',
        centered: true
      },
      {
        field: 'daySerieA',
        label: 'Giornata A',
        centered: true
      },
      {
        field: 'girone',
        label: 'Girone',
        centered: true
      },
      {
        field: 'date',
        label: 'Data',
        centered: true
      },
      {
        field: 'deadline',
        label: 'Scadenza',
        centered: true
      },
      {
        field: '',
        label: 'Calcolata',
        centered: true
      },
      {
        field: 'locked',
        label: 'Invio Form',
        centered: true
      }
    ],
    league: null,
    loading: false,
    response: null,
    scores: {},
    selected: null,
    seiPolitico: false,
    teamToAdd: null
  },
  async mounted () {
    this.league = SAILS_LOCALS.league

    this.loading = true

    const w = JSON.stringify({
      season: this.league.season,
      day: { '>': 0 }
    })

    const response = await axios.get(
      `/fantagiornata?where=${w}&sort=girone ASC&sort=day ASC&limit=100`
    )

    this.loading = false

    this.allFantaGiornate = response.data.map(fg => {
      fg.date = fg.date ? new Date(fg.date) : null
      fg.deadline = fg.deadline ? new Date(fg.deadline) : null
      return fg
    })
    this.selected = this.allFantaGiornate.find(fg => fg.id === this.league.nextFantagiornata.id)
  },
  methods: {
    async lockFantaGiornata (fgId, locked) {
      await axios.patch('/fantagiornata/' + fgId, {
        locked,
        _csrf: window.SAILS_LOCALS._csrf
      })

      window.location.reload()
    },
    async saltaGiornata (fgId) {
      const nextIndex = this.allFantaGiornate.findIndex(fg => fg.id === fgId) + 1
      if (!this.allFantaGiornate[nextIndex]) { return }

      await axios.patch(`/lega/${window.SAILS_LOCALS.league.id}`, {
        nextFantagiornata: this.allFantaGiornate[nextIndex].id,
        _csrf: window.SAILS_LOCALS._csrf
      })

      window.location.reload()
    },
    async calcolaGiornata (day, scores={}, force=false) {
      if (!day) { return }
      this.loading = true
      this.response = null

      try {
        const response = await axios.post('/admin/calcola-giornata', {
          day,
          force,
          scores,
          _csrf: window.SAILS_LOCALS._csrf
        })
        this.response = response.data

        this.$buefy.notification.open({
          message: 'Giornata calcolata correttamente',
          type: 'is-success'
        })
      } catch (e) {
        this.response = null
        this.$buefy.notification.open({
          message: 'Giornata non calcolata. ' + e,
          type: 'is-danger'
        })
      } finally {
        this.loading = false
      }
    },
    fmtDate (date) {
      return date.toLocaleDateString('it', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
      })
    },
    fmtDateTime (date) {
      return date.toLocaleString('it', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'
      })
    },
    openDialog (day) {
      this.calcDay = day
      this.isDialogOpen = true
    },
    async saveFg (i) {
      const data = Object.assign({}, this.allFantaGiornate[i])
      data.date = data.date.toISOString().slice(0, 10)
      data.deadline = data.deadline.toISOString()
      delete data.matches
      data._csrf = SAILS_LOCALS._csrf

      try {
        await axios.patch(`/fantagiornata/${this.allFantaGiornate[i].id}`, data)

        this.$buefy.notification.open({
          message: 'Giornata salvata',
          type: 'is-success'
        })
      } catch (e) {
        this.$buefy.notification.open({
          message: 'Giornata non salvata correttamente. ' + e,
          type: 'is-danger'
        })
      }
    },
    updateFantaVoto (score) {
      score.fantaVoto = score.voto
        + score.assists * 1
        - score.ammonizioni * 0.5
        - score.espulsioni * 1
        - score.failedPenalties * 3
    }
  }
})
