parasails.registerComponent('top-flop-11', {
  data () {
    return {
      activeTab: 0,
      allSchieramenti: [
        [ 1, 4, 3, 3 ],
        [ 1, 5, 3, 2 ],
        [ 1, 3, 4, 3 ],
        [ 1, 4, 4, 2 ]
      ],
      schieramento: null,
      allTop11: null,
      allFlop11: null,
    }
  },
  computed: {
    flop11 () {
      if (!this.schieramento || !this.allFlop11) { return [] }

      let ret = []

      for (let i = 0; i < this.schieramento.length; i++) {
        let byRole = this.allFlop11.filter(x => x.player.Ruolo === (i+1))
        byRole = _.sortBy(byRole, 'fantaVoto').slice(0, this.schieramento[i])
        ret = ret.concat(byRole)
        ret.forEach(x => { x.player.team = this.teams.find(t => t.id === x.player.IDSquadra) })
      }

      return ret
    },
    top11 () {
      if (!this.schieramento || !this.allTop11) { return [] }

      let ret = []

      for (let i = 0; i < this.schieramento.length; i++) {
        let byRole = this.allTop11.filter(x => x.player.Ruolo === (i+1))
        byRole = _.sortBy(byRole, 'fantaVoto').reverse().slice(0, this.schieramento[i])

        ret = ret.concat(byRole)
        ret.forEach(x => { x.player.team = this.teams.find(t => t.id === x.player.IDSquadra) })
      }

      return ret
    }
  },
  async mounted () {
    this.schieramento = this.allSchieramenti[2]

    const lega = window.SAILS_LOCALS.league
    this.teams = lega.teams

    if (!lega.fantagiornata) {
      return
    }

    this.allTop11 = await $.getJSON(`/topflop?day=${lega.fantagiornata.id}&type=top&populate=player`)
    this.allFlop11 = await $.getJSON(`/topflop?day=${lega.fantagiornata.id}&type=flop&populate=player`)
  },
  template: `
<div>
  <div class="columns is-hidden-mobile">
    <div class="column is-half">
      <h2 class="is-size-4 has-text-centered">TOP 11</h2>

      <nav class="panel is-borderless">
        <div
          v-for="entry in top11"
          :key="'topflop-' + entry.id"
          class="panel-block"
        >
          <player-role :role="entry.player.Ruolo" />

          <div class="top-flop__player-name has-text-truncated">
            <span class="has-text-weight-medium">{{ entry.player.Nome }}</span>
            <small class="has-text-grey">{{ entry.player.team.name }}</small>
          </div>

          <strong>{{ entry.fantaVoto }}</strong>
        </div>
      </nav>
    </div>

    <div class="column is-half">
      <h2 class="is-size-4 has-text-centered">FLOP 11</h2>

      <nav class="panel is-borderless">
        <div
          v-for="entry in flop11"
          :key="'topflop-' + entry.id"
          class="panel-block"
        >
          <player-role :role="entry.player.Ruolo" />

          <div class="top-flop__player-name has-text-truncated">
            <span class="has-text-weight-medium">{{ entry.player.Nome }}</span>
            <small class="has-text-grey">{{ entry.player.team.name }}</small>
          </div>

          <strong>{{ entry.fantaVoto }}</strong>
        </div>
      </nav>
    </div>
  </div>

  <b-tabs
    v-model="activeTab"
    position="is-centered"
    class="is-hidden-tablet"
  >
    <b-tab-item label="TOP 11">
      <nav class="panel is-borderless">
        <div
          v-for="entry in top11"
          :key="'topflop-' + entry.id"
          class="panel-block"
        >
          <player-role :role="entry.player.Ruolo" />

          <div class="top-flop__player-name has-text-truncated">
            <span class="has-text-weight-medium">{{ entry.player.Nome }}</span>
            <small class="has-text-grey">{{ entry.player.team.name }}</small>
          </div>

          <strong>{{ entry.fantaVoto }}</strong>
        </div>
      </nav>
    </b-tab-item>

    <b-tab-item label="FLOP 11">
      <nav class="panel is-borderless">
        <div
          v-for="entry in flop11"
          :key="'topflop-' + entry.id"
          class="panel-block"
        >
          <player-role :role="entry.player.Ruolo" />

          <div class="top-flop__player-name has-text-truncated">
            <span class="has-text-weight-medium">{{ entry.player.Nome }}</span>
            <small class="has-text-grey">{{ entry.player.team.name }}</small>
          </div>

          <strong>{{ entry.fantaVoto }}</strong>
        </div>
      </nav>
    </b-tab-item>
  </b-tabs>

  <div class="buttons has-addons is-centered">
    <span
      v-for="s in allSchieramenti"
      :key="'s-' + s.join('-')"
      class="button"
      :class="schieramento === s ? 'is-active is-info' : ''"
      @click="schieramento = s"
    >
      {{ s.slice(1,4).join('-') }}
    </span>
  </div>
</div>
  `
})
