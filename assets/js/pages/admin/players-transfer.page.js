parasails.registerPage('players-transfer', {
  data: {
    allRoles: { P: 1, D: 2, C: 3, A: 4 },
    cost: 0,
    loading: false,
    players: [],
    player: null,
    selectedTeam: null,
    searchTeam: '',
    team: null,
    teams: [],

    loadingUpdates: false,
    loadingNew: false,
    loadingTransfers: false,
    updatesNew: [],
    updatesTransfers: [],
    updatesRun: false,

    fileSelected: false,
    uploadingPhotos: false
  },
  mounted () {
    this.teams = window.SAILS_LOCALS.league.teams
  },
  computed: {
    teamsFiltered () {
      return this.teams.filter((option) => {
        if (this.player && this.player.IDSquadra && this.player.IDSquadra.id === option.id) {
          return false
        }

        return option.name
          .toString()
          .toLowerCase()
          .indexOf(this.searchTeam.toLowerCase()) >= 0
      })
    }
  },
  methods: {
    getAsyncData: _.debounce(async function (name) {
      if (!name.length) {
        this.players = []
        return
      }

      this.loading = true

      const where = { Nome: { contains: name } }
      const url = `/player?where=${JSON.stringify(where)}&populate=IDSquadra`

      try {
        const players = await $.getJSON(url)
        this.players = _.sortBy(players, 'IDSquadra.id')
      } catch (error) {
        this.players = []
        throw error
      } finally {
        this.loading = false
      }
    }, 500),
    async transferPlayer (svincola) {
      try {
        await $.ajax({
          type: 'POST',
          url: `/player/${this.player.id}/transfer`,
          data: JSON.stringify({
            team: svincola ? null : this.team.id,
            cost: this.cost,
            _csrf: window.SAILS_LOCALS._csrf
          }),
          contentType: 'application/json',
          dataType: 'json'
        })

        this.$buefy.notification.open({
          message: `${this.player.Nome} è stato ${svincola ? 'svincolato' : 'trasferito' } correttamente`,
          type: 'is-success'
        })

        this.cost = 0
        this.player = null
        this.team = null
        this.searchTeam = ''
      } catch (e) {
        this.$buefy.notification.open({
          message: `Errore: ${e.message}`,
          type: 'is-danger'
        })
      }
    },
    async findUpdates () {
      this.loadingUpdates = true

      this.updatesNew = []
      this.updatesTransfers = []

      const season = window.SAILS_LOCALS.league.season
      const html = (await axios.get(`https://www.gazzetta.it/calcio/fantanews/statistiche/serie-a-${season}-${season-2000+1}`)).data

      const fantaPlayers = (await axios.get('/player?populate=IDSquadra&limit=5000')).data

      // parse html string in different document to avoid favicon to be replaced
      // with gds one
      const stats = $($.parseHTML(html)).find('table.playerStats')

      let id
      let player
      let role
      let gdsPlayer

      stats.find('tbody tr').each((i, el) => {
        const row = $(el).find('td')

        id = row.eq(2).find('a').attr('href')
        if (id) {
          id = parseInt(id.replace(/\/$/g, '').split('/').pop())
        }

        if (id) {
          player = fantaPlayers.find(x => x.IDGazzetta === id)
        } else {
          player = null
        }

        role = row.eq(3).text().trim()
        if (role.length > 1) {
          role = role[3]
        }

        gdsPlayer = {
          id,
          teamA: row.eq(1).text().trim(),
          player,
          name: row.eq(2).text().trim().toUpperCase().replace(/\.$/, ''),
          role,
          Q: row.eq(4).text().trim(),
          PG: row.eq(5).text().trim(),
          G: row.eq(6).text().trim(),
          A: row.eq(7).text().trim(),
          AM: row.eq(8).text().trim(),
          ES: row.eq(9).text().trim(),
          RT: row.eq(10).text().trim(),
          RR: row.eq(11).text().trim(),
          RS: row.eq(12).text().trim(),
          RP: row.eq(13).text().trim(),
          MV: row.eq(14).text().trim(),
          MM: row.eq(15).text().trim(),
          MP: row.eq(16).text().trim(),
          _loading: false
        }

        gdsPlayer.teamA = gdsPlayer.teamA[0].toUpperCase() + gdsPlayer.teamA.slice(1)

        if (!player) {
          this.updatesNew.push(gdsPlayer)
        } else if (player.SquadraDiA.toLowerCase() !== gdsPlayer.teamA.toLowerCase()) {
          this.updatesTransfers.push(gdsPlayer)
        }

      })

      this.updatesNew = _.sortBy(this.updatesNew, 'name')
      this.updatesTransfers = _.sortBy(this.updatesTransfers, 'name')

      this.loadingUpdates = false
      this.updatesRun = true
    },
    async importPlayer (player) {
      player._loading = true

      try {
        await axios.post(`/player`, {
          SquadraDiA: player.teamA,
          Ruolo: this.getRoleNumber(player.role),
          Nome: player.name,
          IDGazzetta: player.id,
          cost: player.Q,
          _csrf: window.SAILS_LOCALS._csrf
        })
        this.$buefy.notification.open({
          message: `${player.name} è stato importato correttamente`,
          type: 'is-success'
        })
      } catch (e) {
        this.$buefy.notification.open({
          message: `Non è possibile importare ${player.name}`,
          type: 'is-danger'
        })
        console.error(e)
      }

      const i = this.updatesNew.findIndex(item => item.id === player.id)
      this.updatesNew.splice(i, 1)

      player._loading = false
    },
    async updatePlayer (player) {
      player._loading = true

      try {
        await axios.patch(`/player/${player.player.id}`, {
          SquadraDiA: player.teamA,
          _csrf: window.SAILS_LOCALS._csrf
        })
        this.$buefy.notification.open({
          message: `${player.name} è stato aggiornato correttamente`,
          type: 'is-success'
        })
      } catch (e) {
        this.$buefy.notification.open({
          message: `Non è possibile aggiornare ${player.name}`,
          type: 'is-danger'
        })
        console.error(e)
      }

      const i = this.updatesTransfers.findIndex(item => item.id === player.id)
      this.updatesTransfers.splice(i, 1)

      player.loadingTransfers = false
    },
    getRoleNumber (role) {
      return this.allRoles[role]
    },
    async uploadPhotos () {
      if (!this.$refs.fileInput.files[0]) {
        return
      }

      this.uploadingPhotos = true
      const data = new FormData()
      data.append('_csrf', window.SAILS_LOCALS._csrf)
      data.append('photos', this.$refs.fileInput.files[0])

      try {
        const response = await axios.post('/admin/upload-players-photos', data)

        this.$buefy.notification.open({
          message: `Sono state caricate ${response.data.foundPhotos} foto`,
          type: 'is-success'
        })
      } catch (e) {
        this.$buefy.notification.open({
          message: `Non è stato possibile aggiornare le foto: ${e.toString()}`,
          type: 'is-danger'
        })
      } finally {
        this.uploadingPhotos = false
      }
    },
    onFileChange () {
      this.fileSelected = this.$refs.fileInput ? this.$refs.fileInput.files.length === 1 : false
    }
  }
})
