parasails.registerComponent('cannonieri', {
  props: {
    season: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      cannonieri: [],
      page: 0,
      perPage: 10,
      totalPages: 25
    }
  },
  mounted () {
    this.loadData()
  },
  methods: {
    nextPage () {
      if (this.page > (this.totalPages - 1)) { return }
      this.page++
      this.loadData()
    },
    prevPage () {
      if (this.page <= 0) { return }
      this.page--
      this.loadData()
    },
    async loadData () {
      this.cannonieri = await $.getJSON(`/album?season=${this.season}&sort=goals DESC&sort=id&limit=${this.perPage}&skip=${this.page * this.perPage}`)
    }
  },
  template:
`<div v-if="cannonieri.length">
  <nav class="panel is-borderless">
    <a
      v-for="(album, i) in cannonieri"
      :key="album.id"
      class="panel-block"
      :href="album.team && album.player ? '/rose/' + album.team.id + '#' + album.player.id : null"
    >
      <div class="has-text-right" style="width: 25px;margin-right: 8px;">
        {{ page * perPage + i + 1 }}
      </div>

      <div class="has-text-truncated" style="flex:1">
        <span class="has-text-weight-medium">{{ album.player.Nome }}</span>
        <small v-if="album.team" class="has-text-grey">{{ album.team.name }}</small>
      </div>

      <div class="has-text-right has-text-weight-medium">{{ album.goals }}</div>
    </a>
  </nav>

  <div
    class="is-flex"
    style="justify-content: space-around; align-items: center"
  >
    <button
      :disabled="page <= 0"
      class="button"
      @click="prevPage()"
    >
      <span class="icon is-small">
        <i class="fa fa-angle-left"></i>
      </span>
    </button>

    <span class="has-text-grey">
      {{ page + 1 }} / {{ totalPages }}
    </span>

    <button
      :disabled="page > (totalPages - 1)"
      class="button"
      @click="nextPage()"
    >
      <span class="icon is-small">
        <i class="fa fa-angle-right"></i>
      </span>
    </button>
  </div>
</div>

<small v-else>
  <i>Nessun giocatore trovato</i>
</small>`
})
