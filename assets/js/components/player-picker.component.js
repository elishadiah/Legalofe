parasails.registerComponent('player-picker', {
  props: {
    return: {
      type: String,
      default: 'id'
    },
    value: {
      type: [ Object, String, Number ],
      required: false,
      default: null
    }
  },
  data () {
    return {
      loading: false,
      players: []
    }
  },
  computed: {
    selectedPlayer: {
      get () { return this.value },
      set (val) { this.$emit('input', val) }
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
    }, 500)
  },
  template: `
    <b-autocomplete
      ref="autocomplete"
      :data="players"
      field="Nome"
      placeholder="Giocatore"
      :loading="loading"
      @select="option => { selectedPlayer = option[this.return]; this.$refs.autocomplete.$el.querySelector('input').focus() }"
      @typing="getAsyncData"
    >
      <template slot-scope="{ option }">
        <div class="media">
          <div class="media-left">
            <img width="32" :src="'/uploads/foto/' + option.Codice + '.png'">
          </div>

          <div class="media-content">
            <strong>{{ option.Nome }}</strong>

            <div>
              <span v-if="option.IDSquadra">{{ option.IDSquadra.name }}</span>
              <span v-else>Nessna Squadra</span>

              &bull; {{ option.SquadraDiA }} &bull; $ {{ option.cost }}
            </div>
          </div>
        </div>
      </template>
    </b-autocomplete>`
})
