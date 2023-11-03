const EVENT_IMAGES = {
  1: 'amm_s.png',
  2: 'esp_s.png',
  3: 'golfatto_s.png',
  4: 'golsubito_s.png',
  5: 'assist_s.png',
  6: 'assist_s.png',
  7: 'rigoreparato_s.png',
  8: 'rigoresbagliato_s.png',
  9: 'rigoresegnato_s.png',
  10: 'autogol_s.png',
  11: 'golvittoria_s.png',
  12: 'golpareggio_s.png',
  13 : '',
  14: 'uscito_s.png',
  15: 'entrato_s.png',
  16: 'golAnnullatoVAR_xs.png',
  17: 'infortunato_xs.png',
  20: 'assist_s.png',
  21: 'assist_s.png',
  22: 'assist_s.png',
  23: 'assist_s.png',
  24: 'assist_s.png'
}

const EVENT_NAMES = {
  1: '-0.5 AMMONIZIONE',
  2: '-1 ESPULSIONE',
  3: 'GOL FATTO',
  4: 'GOL SUBITO',
  5: '+1 ASSIST',
  6: '+1 ASSIST',
  7: '+3 RIGORE PARATO',
  8: '-3 RIGORE SBAGLIATO',
  9: 'RIGORE SEGNATO',
  10: 'AUTOGOL',
  11: 'GOL VITTORIA',
  12: 'GOL PAREGGIO',
  13: '',
  14: 'USCITO',
  15: 'ENTRATO', 
  16: 'GOL ANNULLATO DAL VAR',
  17: 'INFORTUNATO',
  20: '+1 ASSIST',
  21: '+1 ASSIST',
  22: '+1 ASSIST',
  23: '+1 ASSIST',
  24: '+1 ASSIST'
}

const EVENTS_SCORES = {
  4: 0,
  9: +1,
  3: +1

}

const EVENTS_SCORES_FV = {
  1: -0.5,
  2: -1,
  3: 0,
  4: 0,
  5: 1,
  6: 1,
  7: 3,
  8: -3,
  9: 0,
 16: 0,
 17: 0,
 20: 1,
 21: 1,
 22: 1,
 23: 1,
 24: 1
 
}

const ROLES_LETTERS = ['&nbsp;', 'P', 'D', 'C', 'A' ]

const SQUADRE_FG = {
  Atalanta: 1,
  Bologna: 2,
  Cagliari: 21,
  Empoli: 5,
  Fiorentina: 6,
  Genoa: 8,
  Inter: 9,
  Juventus: 10,
  Lazio: 11,
  Milan: 12,
  Napoli: 13,
  Parma: 107,
  Roma: 15,
  Salernitana: 137,
  Sampdoria: 16,
  Sassuolo: 17,
  Torino: 18,
  Udinese: 19,
  Verona: 20,
  Venezia: 138,
  Spezia: 129,
  Cremonese: 144,
  Lecce: 119,
  Monza: 143,
  Frosinone: 7
  
}

const MESI = [ 'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic' ]
const GIORNI = [ 'Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab' ]

parasails.registerComponent('match-results', {
  props: {
    calculateScore: {
      type: Boolean,
      default: false
    },
    fantagiornataId: {
      type: Number,
      required: false,
      default: null
    }, 
    live: {
      // Refresh score each N minutes
      type: Boolean,
      default: false
    },
    scoreSource: {
      type: String,
      default: 'fg'
    },
    showStandings: {
      // Set to false in home page to hide standings
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      allFantaGiornate: [],
      allMatches: [],
      bonusCasa: 0,
      bonusFuori: 0,
      cGio: 0,
      cInco: null,
      currentSeason: 0,
      datiSquadre: [],
      daySerieA: null,
      fantagiornata: null,
      formazioneCasa: [],
      formazioneFuori: [],
      lastUpdate: new Date(),
      nextMatchId: 0,
      placeholderStanding: [],
      players: [],
      reservePlayersUsed: {},
      scoreCasa: 0,
      scoreFuori: 0,
      scores: [],
      standings: [],
      updateInterval: 3 * 60 // in seconds
    }
  },
  computed: {
    currentMatch () {
      return this.scores.find(s => s.id === this.cInco)
    },
    // dataGiornata () {
    //   var x = dataGiornata.slice(0)
    //   x.shift()
    //   return x
    // },
    hasFattoreCampo () {
      return false
    },
    playersToShow () {
      return this.calculateScore ? 19 : 100
    },
    formattedDate () {
      if (!this.fantagiornata) { return '' }
      const date = new Date(this.fantagiornata.date)
      return `${GIORNI[date.getDay()]} ${date.getDate()} ${MESI[date.getMonth()]} ${date.getFullYear()}`
    }
  },
  methods: {
    setSearchParam () {
      setSearchParam(...arguments)
    },
    getFantaVoto (player, role) {
      if (this.scoreSource === 'fg') {
        if (player.voto === 'SV') { return 'SV' }

        let fv = player.voto
        for (let evento of player.events) {
          fv += EVENTS_SCORES_FV[evento] || 0
        }
        return fv
      } else if (this.scoreSource === 'gds') {
        return player.voto
          + (player.assists || 0) * 1
          - (player.ammonizioni || 0) * 0.5
          - (player.espulsioni || 0) * 1
          - (player.failedPenalties || 0) * 3
          + ((role === 1) ? (player.penalties || 0) * 3 : 0)
      }
    },
    createEvents (player, role) {
      let events = []

      const EVENT_PROPS = {
        ammonizioni: 1,
        espulsioni: 2,
        goals: 3,
        autogoals: 10,
        assists: 5,
        assists: 20,
      	assists: 21,
        assists: 22,
        assists: 23,
      	assists: 24,
        failedPenalties: 8,
        penalties: role === 1 ? 7 : 9
      }

      for (let prop in EVENT_PROPS) {
        for (let x = 0; x < player[prop]; x++) {
          events.push(EVENT_PROPS[prop])
        }
      }

      return events
    },
    loadScoreData () {
      this.datiSquadre = []
      let allDefferred = []
      if (this.scoreSource === 'fg') {
        // for (let teamId of Object.values(SQUADRE_FG)) {
        //   allDefferred.push(
        //     //$.getJSON(`https://www.fantacalcio.it/api/live/${teamId}?g=${this.daySerieA}&i=${this.currentSeason-2005}`)
        //     .then(result => {
        //         result.forEach(item => {
        //           if (item.voto >= 15) {
        //             item.voto = 0
        //           }
        //         })

        //         this.datiSquadre[teamId] = result
        //         this.lastUpdate = new Date()
        //       })
        //       .catch(() => {
        //         console.warn('Errore: voti fantagazzetta non caricati')
        //       })
        //   )
        // }
        // $.when.apply($, allDefferred).then(this.updateMatchScores)
          
        
      for (const [key, value] of Object.entries(window.SAILS_LOCALS.playerV)) {
        this.datiSquadre[SQUADRE_FG[key]]=value
      }

        this.updateMatchScores()
      } else if (this.scoreSource === 'gds') {
        $.getJSON(`/scores?season=${this.currentSeason}&day=${this.daySerieA}&source=gds`)
          .then(result => {
            this.datiSquadre = result
            this.updateMatchScores()
          })
      }

      // Use only during development
      // $.getJSON('/data/score-' + this.cGio + '.json', function (result) {
      //   _this.datiSquadre = result
      //   _this.updateMatchScores()
      //   _this.lastUpdate = new Date()
      // });
    },
    async loadStandings (match) {
      await $.getJSON(`/formazione?day=${match}`)
        .done(result => {
          this.standings = result
        })
    },
    sortStanding (standing) {
      for (let player of standing.players) {
        player.pos = standing.playersPositions.find(x => x.id === player.id).pos
      }

      return _.sortBy(standing.players, 'pos')
    },
    updateMatchScores () {
      this.scores = []
      this.reservePlayersUsed = {}

      for (let i in this.allMatches) {
        let match = this.allMatches[i]
        let standing = null
        let home = {}
        let away = {}

        standing = this.standings.find(s => s.team.id === match.teamHome.id)
        if (standing) {
          standing = this.sortStanding(standing)
          home = this.getScore(standing)
        }

        standing = this.standings.find(s => s.team.id === match.teamAway.id)
        if (standing) {
          standing = this.sortStanding(standing)
          away = this.getScore(standing)
        }

        if (home.score >= 0 && away.score >= 0) {
          home.score += away.autogol
          away.score += home.autogol

          home.scorers = home.scorers.concat(away.autoScorers)
          away.scorers = away.scorers.concat(home.autoScorers)
        }

        home.team = match.teamHome
        away.team = match.teamAway

        console.log(`${match.teamHome.name} - ${home.score} - ${home.bonus} (AG ${home.autogol})`)
        console.log(`${match.teamAway.name} - ${away.score} - ${away.bonus} (AG ${away.autogol})`)

        this.scores.push({ id: match.id, home, away })
      }

      this.onChangeMatch()
    },
    setCurrentMatch (matchId) {
      const query = `?Gio=${this.cGio}&Inco=${matchId}`

      if (this.showStandings) {
        this.cInco = matchId
        this.onChangeMatch()

        window.history.pushState({}, '', query)
      } else {
        window.location = '/live' + query
      }
    },
    onChangeMatch () {
      // Scores not loaded yet
      const score = this.scores.find(s => s.id === this.cInco)
      if (!score) { return }

      var home = score.home
      var away = score.away

      this.scoreCasa = home.score
      this.bonusCasa = home.bonus
      this.formazioneCasa = home.standing || this.placeholderStanding

      this.scoreFuori = away.score
      this.bonusFuori = away.bonus
      this.formazioneFuori = away.standing || this.placeholderStanding
    },
    onChangeMatchDay () {
      location.search = 'Gio=' + this.cGio + '&Inco=' + this.cInco
    },
    findPlayerScore (player) {
      if (!this.datiSquadre.length) { return null }

      let teamScore = null

      if (this.scoreSource === 'fg') {
        const serieAteamId = SQUADRE_FG[player.SquadraDiA]
        teamScore = this.datiSquadre[serieAteamId]

        // This team didn't play yet
        if (!teamScore || teamScore.length === 0) {
          return null
        }

        for (var i in teamScore) {
          var p = teamScore[i]

          if (p.voto && // check if player has a vote
              (this.getLastName(player) === p.nome ||
              this.getLastName(player) === p.nome.split(' ')[0] ||
              // fix for players like DI FRANCESCO F
              this.getLastName(player) === p.nome.replace(/\s+\w$/, ''))) {
            return p
          }
        }
        // The player's team played, he didn't
        return undefined
      } else if (this.scoreSource === 'gds') {
        teamScore = this.datiSquadre.find(x => x.teamA === player.SquadraDiA.toLowerCase())
        if (teamScore) {
          teamScore = teamScore.scores
        } else if (player.SquadraDiA && player.SquadraDiA != 'SERIEMINORE') {
          // 6 politico
          return {
            ammonizioni: 0,
            assists: 0,
            autogoals: 0,
            espulsioni: 0,
            failedPenalties: 0,
            // fantaVoto: 6,
            goals: 0,
            penalties: 0,
            voto: 6
          }
        } else {
          console.warn(`Il giocatore ${player.Nome} appartiene ad una squadra sconosciuta: ${player.SquadraDiA}`)
        }

        if (!teamScore) {
          return null
        } else {
          let s = teamScore.find(x => x.voto && parseInt(x.id) === player.IDGazzetta)
          if (s) { return s }
          for (const team of this.datiSquadre) {
            s = team.scores.find(x => x.voto && parseInt(x.id) === player.IDGazzetta)
            if (s) {
              // console.log('=> Giocatore trovato in altra squadra', player.Nome)
              return s
            }
          }
          return s
        }
      }//ifgds
    },
    findSubstitutePlayer (player, standing) {
      for (var x = 11; x < standing.length; x++) {
        var substitute = standing[x]

        if (player.Ruolo === substitute.Ruolo &&
            // se il 1o e 2o portiere non giocano, usa il 3o
            (substitute.pos < 100 || player.Ruolo === 1) &&
            !this.reservePlayersUsed[substitute.Nome]) {

          var score = this.findPlayerScore(substitute)
          if (score) {
            this.reservePlayersUsed[substitute.Nome] = true
            standing[x] = player
            console.debug('found sub', substitute.Nome)
            return [substitute, score]
          }
        }
      }
    },
    getScore (formazione) {
      var score = 0
      var bonus = 0
      var autogol = 0
      var standing = []
      let scorers = []
      let autoScorers = []

      for (var i in formazione) {
        var p = formazione[i]

        if (!this.calculateScore) {
          p.lastName = this.getLastName(p)
          standing.push(p)
          continue
        }

        var player = this.findPlayerScore(p)

        if (player === null && i < 11) {
          // the player's team didn't play
          let x = this.findSubstitutePlayer(p, formazione)
          if (x) {
            player = x[1]
            player.substituted = p.Nome
            // Old player
            p = x[0]
          } else {
            p.fantaVoto = 'SV'
          }
        } else if ((player === undefined ||
            (player && player.voto === 0)) && i < 11) {
          // the player didn't play yet his team did
          // or the player played but the score is 0 (played few minutes)
          let x = this.findSubstitutePlayer(p, formazione)
          if (x) {
            // New player that replace old one
            player = x[1]
            player.substituted = p.Nome
            // Old player
            p = x[0]
          } else {
            player = null
          }
        }

        if (player) {
          p.substituted = player.substituted

          if (this.scoreSource === 'fg') {
            p.events = player.evento ? player.evento.split(',') : []
            //console.log("split in ", p.evento," in-> ", p.events)
            player.events = p.events
          } else if (this.scoreSource === 'gds') {
            p.events = this.createEvents(player, p.Ruolo)
            player.events = p.events
          }

          p.voto = player.voto
          p.fantaVoto = this.getFantaVoto(player, p.Ruolo)
          p.modif = p.modif || p.fantaVoto - p.voto
          if (!p.voto) { p.voto = null }
          if (!p.fantaVoto) { p.fantaVoto = 'SV' }

          p.goals = (player.goals > 0) ? player.goals : 0
          p.autogoals = player.autogoals
        } else {
          // Player team didn't play, no substitute, leave it there
          p.events = []
          p.autogoals = 0
          p.goals = 0

          // Riserva d'ufficio solo per titolari
          if (!p.fantaVoto) {
            p.fantaVoto = (i < 11) ? 3 : 'SV'
          }
        }

        p.lastName = this.getLastName(p)

        if (i < 11) {
          if (this.scoreSource === 'fg') {
            p.autogoals = 0

            score += p.events.reduce((acc, curr) => {
              // Event ID 10 is autogol
              if (curr === '10') { p.autogoals += 1 }
              if (curr === '9' || curr === '3') { p.goals += 1 }
              return acc + (EVENTS_SCORES[parseInt(curr)] || 0)
            }, 0)

            autogol += p.autogoals || 0
            bonus += (p.fantaVoto !== 'SV') ? p.fantaVoto : 0
          } else if (this.scoreSource === 'gds') {
            if (p.goals) { console.log('GOAL:', p.goals, p.Nome) }
            score += p.goals
            autogol += p.autogoals || 0
            bonus += (p.fantaVoto !== 'SV') ? p.fantaVoto : 0
          }

          if (p.goals) {
            let scorer = p.lastName.toLowerCase()
            if (p.goals > 1) {
              scorer += ` (${p.goals})`
            }
            scorers.push(scorer)
          }

          if (p.autogoals) {
            autoScorers.push(`${p.lastName.toLowerCase()} (AG)`)
          }

          // console.log(`${p.lastName} ${p.fantaVoto} (${p.voto}) pos(${p.pos})`)
        }

        standing.push(p)
      }

      const playersByCost = _.sortByAll(
        standing.slice(1,11).filter(p => !!p.voto),
        [ 'fantaVoto', 'cost' ])

      if (bonus > 50 &&bonus <= 59.5) {
        // Additional autogol based on bonus
        const malusGoals = Math.floor((64.5 - bonus) / 5)
        autogol += malusGoals
        
        for (let i = 0; i < malusGoals; i++) {
          const scorer = playersByCost.shift()
          const name = scorer ? scorer.lastName.toLowerCase() : 'Nessuno'
          
          scorers.push(`${name} (AG/M)`)
        }
      } else if (bonus >= 67.5) {
        // Additional gol based on bonus
        const bonusGoals = Math.floor((bonus - 64.5) / 3)
        score += bonusGoals

        for (let i = 0; i < bonusGoals; i++) {
          const scorer = playersByCost.pop()
          const name = scorer ? scorer.lastName.toLowerCase() : 'Nessuno'
          
          scorers.push(`${name} (B)`)
        }
      }

      return { score, bonus, autogol, standing, scorers, autoScorers }
    },
    getLastName (player) {
      let lastName
      if (player.lastName) {
        // If last name is already set, use it
        lastName = player.lastName
      } else if (player.Nome) {
        // Take only the UPPERCASE part of the full name
        lastName = player.Nome.match(/^(?:[A-Z'\-]+ )+/)[0].trim()
      }

      if (!lastName) { console.log('no name', player) }
      return lastName
    },
    getRoleLetter (role) {
      return ROLES_LETTERS[role]
    },
    getTeamLogo (team) {
      return '/uploads/' + team.logo
    },
    getSerieALogo (team) {
      return 'https://content.fantacalcio.it/web/img/team/ico/' + team.toLowerCase() + '.png'
    },
    getEventImage (event) {
      const img = EVENT_IMAGES[event]
      return img ? `/images/live/${img}` : null
    },
    getEventName (event) {
      return EVENT_NAMES[event]
    },
    fillQueryParams () {
      this.cGio = parseInt(getSearchParam('Gio')) || this.nextMatchId
      this.cInco = parseInt(getSearchParam('Inco')) || null
    }
  },
  async mounted () {
    const season = getCookie('season')
    const url = season ? `/lega?season=${season}&limit=1` : '/lega?active=1&limit=1'

    // fill placeholder standing
    for (let i = 0; i < 25; i++) {
      this.placeholderStanding.push({
        lastName: '-',
        Ruolo: 0,
        SquadraDiA: '&nbsp;'
      })
    }

    await $.getJSON(url)
      .done(lastPlayed => {
        const currentLeague = lastPlayed.length ? lastPlayed[0] : null
        this.currentSeason = currentLeague ? currentLeague.season : null
        this.nextMatchId = getSearchParam('Gio') || this.fantagiornataId || ((currentLeague && currentLeague.nextFantagiornata) ? currentLeague.nextFantagiornata.id : null)
        this.fillQueryParams()
      })

    if (!this.nextMatchId) { return }

    await $.getJSON(`/fantagiornata/${this.nextMatchId}`)
      .done(fantagiornata => {
        this.fantagiornata = fantagiornata
        this.daySerieA = fantagiornata.daySerieA
      })


    window.onpopstate = () => {
      this.fillQueryParams()
      this.onChangeMatch()
    }

    await $.getJSON(`/fantaincontro?IDFantagiornata=${this.cGio}`)
      .then(matches => {
        this.allMatches = matches
      })

    $.getJSON(`/fantagiornata?where={"season":${this.currentSeason},"day":{">":0}}&limit=100`)
      .then(giornate => { this.allFantaGiornate = giornate })

    if (!this.allMatches.length) {
      // No matches found
      return
    }

    if (!this.cInco && this.showStandings) {
      this.cInco = this.allMatches[0].id
    }

    await this.loadStandings(this.cGio)

    // Load score from API only if this component is mounted in the live page
    if (this.calculateScore) {
      this.loadScoreData()
      if (this.live && this.cGio === this.nextMatchId) {
        setInterval(this.loadScoreData, this.updateInterval * 1000)
      }
    } else {
      this.updateMatchScores()
    }

    this.onChangeMatch()
  },
  template: `
  <div>
    <div v-if="nextMatchId && allMatches.length" class="box">
      <div
        v-if="live"
        class="is-size-5"
        style="border-bottom:1px solid lightgrey"
      >
        <strong>Live</strong>
      </div>

      <div class="matches__container is-hidden-mobile">
        <div
          v-for="(match, i) in allMatches"
          :key="'match-' + match.id"
          class="live-match__container"
          :class="{selected: match.id === cInco}"
          style="margin-bottom: 0"
          @click="setCurrentMatch(match.id)"
        >
          <div class="live-match__row">
            <div class="live-match--logo" :style="{ 'background-image': 'url('+getTeamLogo(match.teamHome)+')' }" />
            <div class="live-match--name">
              {{ match.teamHome.name }}
            </div>
            <p class="score__container" v-if="calculateScore">
              {{ (scores[i] && scores[i].home.score >= 0) ? scores[i].home.score : '-' }}
            </p>
          </div>

          <div class="live-match__row">
            <div class="live-match--logo" :style="{ 'background-image': 'url('+getTeamLogo(match.teamAway)+')' }" />
            <div class="live-match--name">
              {{ match.teamAway.name }}
            </div>
            <p class="score__container" v-if="calculateScore">
              {{ (scores[i] && scores[i].away.score >= 0) ? scores[i].away.score : '-' }}
            </p>
          </div>
        </div>
      </div>

      <nav class="panel is-borderless has-text-weight-medium is-hidden-tablet">
        <a
          v-for="(match, i) in allMatches"
          :key="'match-' + match.id"
          class="panel-block"
          :class="{selected: match.id === cInco}"
          @click="setCurrentMatch(match.id)"
        >
          <div style="flex: 1 1 0; text-align: right">{{ match.teamHome.name }}</div>
          <div style="margin: 0 .5em">
            {{ (scores[i] && scores[i].home.score >= 0) ? scores[i].home.score : (calculateScore ? '&nbsp;' : '') }} -
            {{ (scores[i] && scores[i].away.score >= 0) ? scores[i].away.score : (calculateScore ? '&nbsp;' : '') }}
          </div>
          <div style="flex: 1 1 0">{{ match.teamAway.name }}</div>
        </a>
      </nav>

      <div v-if="live" class="progress__container">
        <div class="progress--bar" :style="{ animationDuration: updateInterval + 's' }"></div>
      </div>
    </div>

    <i v-else class="has-text-dark"><small>Prossimi incontri non disponibili</small></i>

    <div v-if="currentMatch && showStandings" class="box">
      <div class="has-text-right">
        <div class="select">
          <select
            v-model="cGio"
            @input="setSearchParam('Gio', $event.target.value)"
          >
            <option value="null">Scegli FantaGiornata</option>
            <option
              v-for="g in allFantaGiornate"
              :key="'giornata-' + g.id"
              :value="g.id"
            >
              {{ g.day }} - Campionato {{ g.girone === 1 ? 'Di Apertura' : 'De Clausura' }}
            </option>
          </select>
        </div>
      </div>

      <div class="match-result">
        <div class="match-result__teams">
          <figure class="image match-result__logo">
            <img :src="getTeamLogo(currentMatch.home.team)">
          </figure>

          <div class="match-result__teams__names">
            <div class="match-result__team has-text-right is-hidden-touch">
              <div class="match-result__team-name is-size-2">{{ currentMatch.home.team.name }}</div>
              <div v-if="currentMatch.home.scorers" class="is-capitalized">
                {{ currentMatch.home.scorers.join(', ') }}
              </div>
            </div>

            <div class="match-result__score is-size-2">
              <span v-if="calculateScore">{{ currentMatch.home.score }}</span>
              <span v-if="!calculateScore" class="is-hidden-touch">-</span>
              <span v-if="calculateScore">-</span>
              <span v-if="calculateScore">{{ currentMatch.away.score }}</span>
            </div>

            <div class="match-result__team has-text-left is-hidden-touch">
              <div class="match-result__team-name is-size-2">{{ currentMatch.away.team.name }}</div>
              <div v-if="currentMatch.away.scorers" class="is-capitalized">
                {{ currentMatch.away.scorers.join(', ') }}
              </div>
            </div>
          </div>

          <figure class="image match-result__logo">
            <img :src="getTeamLogo(currentMatch.away.team)">
          </figure>
        </div>

        <div class="is-flex is-hidden-desktop" style="margin-top:2em;">
          <div class="match-result__team has-text-right" style="margin-right:.5em;">
            <div class="match-result__team-name is-size-4-tablet is-size-5-mobile">{{ currentMatch.home.team.name }}</div>
            <div v-if="currentMatch.home.scorers" class="is-capitalized">
              {{ currentMatch.home.scorers.join(', ') }}
            </div>
          </div>
          <div class="match-result__team has-text-left" style="margin-left:.5em;">
            <div class="match-result__team-name is-size-4-tablet is-size-5-mobile">{{ currentMatch.away.team.name }}</div>
            <div v-if="currentMatch.away.scorers" class="is-capitalized">
              {{ currentMatch.away.scorers.join(', ') }}
            </div>
          </div>
        </div>

        <div v-if="calculateScore" class="match-result__bonus">
          <div class="is-size-3 has-text-right">{{ currentMatch.home.bonus }}</div>
          <div style="flex:0">TOTALE</div>
          <div class="is-size-3">{{ currentMatch.away.bonus }}</div>
        </div>

        <div v-if="hasFattoreCampo">
          <span>{{ currentMatch.FattoreCampo }}</span>
          FATTORE CAMPO
          <span>{{ currentMatch.FattoreCampo }}</span>
        </div>

        <div class="field is-grouped is-grouped-multiline" style="justify-content:center">
          <div class="control">
            <span class="tags has-addons">
              <span class="tag is-info">{{ fantagiornata.day }}<sup>a</sup>&nbsp;<span>{{ [ '', 'Apertura', 'Clausura' ][fantagiornata.girone] }}</span></span>
              <span class="tag">{{ fantagiornata.daySerieA }}<sup>a</sup>&nbsp;Serie A</span>
            </span>
          </div>

          <div class="control has-text-grey">
            {{ formattedDate }}
          </div>
        </div>
      </div>

      <div class="columns is-mobile">
        <div class="column is-half match-result__standing">
          <div class="settitolarisin has-text-centered">
            {{ formazioneCasa.length ? 'TITOLARI' : 'FORMAZIONE NON INSERITA' }}
          </div>

          <template v-for="(player, j) in formazioneCasa.slice(0,playersToShow)">
            <div
              v-if="j === 11"
              class="panchina-header has-text-centered"
              :key="'panchina-' + j"
            >
              PANCHINA
            </div>

            <div
              v-if="j === 19"
              class="panchina-header has-text-centered"
              :key="'no-' + j"
            >
              NON IN CAMPO
            </div>

            <div
              :key="'player-' + j"
              class="player-score"
            >
              <div class="player-score__container left">
                <p><strong>{{ player.fantaVoto }}</strong></p>
                <p>
                  {{ player.voto }}
                  <span v-if="player.modif" class="is-hidden-touch">({{ player.modif }})</span>
                  <span>
                    <img
                      v-for="(event, e) in player.events"
                      v-if="!!getEventImage(event)"
                      class="player-score__icon"
                      :title="getEventName(event)"
                      :src="getEventImage(event)"
                      :key="'event-' + e"
                    />
                  </span>
                </p>
              </div>

              <div class="player-score__player has-text-right">
                <img
                  v-if="player.sostituto"
                  class="player-score__icon"
                  src="/img/sostituzione.png"
                />
                <span><strong>{{ player.lastName }}</strong></span>
                <p class="player-team" v-html="player.SquadraDiA" />
              </div>

              <div class="player-score__role">
                <span
                  :class="'player-role player-role--' + player.Ruolo"
                  v-html="getRoleLetter(player.Ruolo)" />
              </div>
            </div>
          </template>
        </div>

        <div class="column is-half match-result__standing">
          <div class="settitolarisin has-text-centered">
            {{ formazioneFuori.length ? 'TITOLARI' : 'FORMAZIONE NON INSERITA' }}
          </div>

          <template v-for="(player, j) in formazioneFuori.slice(0,playersToShow)">
            <div
              v-if="j === 11"
              class="panchina-header has-text-centered"
              :key="'panchina-' + j"
            >
              PANCHINA
            </div>

            <div
              v-if="j === 19"
              class="panchina-header has-text-centered"
              :key="'no-' + j"
            >
              NON IN CAMPO
            </div>

            <div
              class="player-score"
              :key="'player-' + j"
            >
              <div class="player-score__role">
                <span
                  :class="'player-role player-role--' + player.Ruolo"
                  v-html="getRoleLetter(player.Ruolo)" />
              </div>

              <div class="player-score__player has-text-left">
                <span><strong>{{ player.lastName }}</strong></span>
                <img
                  v-if="player.sostituto"
                  class="player-score__icon"
                  src="/img/sostituzione.png"
                />
                <p class="player-team" v-html="player.SquadraDiA" />
              </div>

              <div class="player-score__container right">
                <p><strong>{{ player.fantaVoto }}</strong></p>
                <p>
                  <span>
                    <img
                      v-for="(event, e) in player.events"
                      v-if="!!getEventImage(event)"
                      class="player-score__icon"
                      :title="getEventName(event)"
                      :src="getEventImage(event)"
                      :key="'event-' + e"
                    />
                  </span>
                  <span v-if="player.modif" class="is-hidden-touch">({{ player.modif }})</span>
                  {{ player.voto }}
                </p>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
  `
})
