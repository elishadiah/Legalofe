parasails.registerPage('xxx', {
  data: {
    filter: [],
    loading: false,
    nameSearch: null,
    page: 0,
    pageSize: 50,
    paginationEnd: false,
    players: []
  },
  methods: {
    async fetchPlayers (append = false) {
      this.loading = true

      let url = `/player?sort=Nome ASC&populate=false`
      const where = {}

      // pagination
      url += `&limit=${this.pageSize}&skip=${this.page * this.pageSize}`

      // only players with a team
      where.IDSquadra = { '>': 0 }

      // filter
      if (this.filter.length) {
        where.or = []
        for (const f of this.filter) {
          const fObj = {}
          fObj[f.split('=')[0]] = f.split('=')[1]
          where.or.push(fObj)
        }
      }

      if (this.nameSearch) {
        where.Nome = { contains: this.nameSearch}
      }

      url += `&where=${JSON.stringify(where)}`

      const players = await $.getJSON(url)

      this.paginationEnd = players.length < this.pageSize

      if (append) {
        this.players = this.players.concat(players)
      } else {
        this.players = players
      }

      this.loading = false
    },
    toggleFilter (value) {
      const index = this.filter.indexOf(value)

      if (index > -1) {
        this.filter.splice(index, 1)
      } else {
        this.filter.push(value)
      }

      this.nameSearch = ''
      this.players = []
      this.page = 0

      this.fetchPlayers()
    },
    searchByName () {
      this.filter = []
      this.players = []

      this.fetchPlayers()
    },
    infiniteScroll () {
      if (window.scrollY > (document.querySelector('#quotazioni').offsetHeight - window.outerHeight) &&
        !this.loading &&
        !this.paginationEnd) {
        this.page++
        this.fetchPlayers(true)
      }
    }
  },
  mounted () {
    this.fetchPlayers()

    window.addEventListener('scroll', this.infiniteScroll)
  },
  beforeDestroy () {
    window.removeEventListener('scroll', this.infiniteScroll)
  }
})
