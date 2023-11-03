parasails.registerPage('quotazioni', {
  data: {
    allFantaTeams: [],
    allRoles: { P: 1, D: 2, C: 3, A: 4 },
    allTeams: [],
    filteredPlayers: [],
    filters: {},
    matches: [],
    nameSearch: null,
    players: []
  },
  async mounted() {
    const season = window.SAILS_LOCALS.league.season
    const html = await $.get(`https://www.gazzetta.it/calcio/fantanews/statistiche/serie-a-${season}-${season-2000+1}`)

    const fantaPlayers = await $.get('/player?where={"IDSquadra":{">":0}}&populate=IDSquadra&limit=300')

    // parse html string in different document to avoid favicon to be replaced
    // with gds one
    const stats = $($.parseHTML(html)).find('table.playerStats')

    let id
    let player
    let role
    const allTeams = new Set()
    const allFantaTeams = new Set()

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
      console.log('QQQ-->>>', role);
      if (role.length > 1) {
        // role = role[3]
        role = role[0];
      }

      this.players.push({
        id,
        teamA: row.eq(1).text().trim(),
        player,
        name: row.eq(2).text().trim(),
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
        MP: row.eq(16).text().trim()
      })

      allTeams.add(row.eq(1).text().trim())
      if (player) {
        allFantaTeams.add(player.IDSquadra.name)
      }
    })

    this.players = _.sortBy(this.players, 'name')

    this.allTeams = Array.from(allTeams)
    this.allFantaTeams = Array.from(allFantaTeams)

    this.updateFilter()
  },
  methods: {
    getRoleNumber (role) {
      return this.allRoles[role]
    },
    updateFilter (what, value) {
      if (what) {
        if (this.filters[what]) {
          delete this.filters[what]
        } else {
          this.filters[what] = value
        }
      }

      this.nameSearch = null

      this.filteredPlayers = this.filters.hasOwnProperty("team")
      ? _.filter(this.players, { player: { IDSquadra: { name: value } } })
      : _.filter(this.players, this.filters);
      console.log('TEST1-->>>', this.filteredPlayers);
    },
    escapeRegExp (str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
    },
    searchByName: _.debounce(function () {
      this.filters = {}
      const re = new RegExp(this.escapeRegExp(this.nameSearch), 'i')

      this.filteredPlayers = this.players.filter(p => !!re.test(p.name))
    }, 350)
  }
})
