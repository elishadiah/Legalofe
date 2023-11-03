const { getLastName } = require('./helpers')

module.exports = function MatchScores (season, day) {
  this.datiSquadre = []
  this.eventsScores= {
    4: 0,
    9: +1,
    3: +1
  }
  this.reservePlayersUsed = {}
  this.allPlayersScores = []

  this.getFantaVoto = function (player, role) {
    return player.voto
      + player.assists * 1
      - player.ammonizioni * 0.5
      - player.espulsioni * 1
      - player.failedPenalties * 3
      + ((role === 1) ? player.penalties * 3 : 0)
  }

  this.updateMatchScores = function (standings, matches, force=false) {
    let scores = []
    this.reservePlayersUsed = {}

    for (let match of matches) {
      let standing = null
      let home = null
      let away = null

      standing = standings.find(s => s.team === match.teamHome.id)
      if (standing) {
        sails.log.verbose(`--- ${match.teamHome.name} ---`)
        standing = this.sortStanding(standing)
        home = this.getScore(standing, force)
      } else {
        sails.log.warn(`Team ${match.teamHome.name} has no standing`)
      }

      standing = standings.find(s => s.team === match.teamAway.id)
      if (standing) {
        sails.log.verbose(`--- ${match.teamAway.name} ---`)
        standing = this.sortStanding(standing)
        away = this.getScore(standing, force)
      } else {
        sails.log.warn(`Team ${match.teamAway.name} has no standing`)
      }

      if (home && away) {
        home.score += away.autogol
        away.score += home.autogol

        home.scorers = home.scorers.concat(away.autoScorers)
        away.scorers = away.scorers.concat(home.autoScorers)
      }

      sails.log.info(
        `${match.teamHome.name} ${home ? home.score : '-'} (${home ? home.bonus : '-'}) vs ` +
        `(${away ? away.bonus : '-'}) ${away ? away.score : '-'} ${match.teamAway.name}`)

      scores.push({ home, away })
    }

    return scores
  }

  this.findPlayerScore = function (player, force = false) {
    if (!player.IDGazzetta) { sails.log.warn('no gazzetta id', player.Nome) }

    // let teamScore = this.datiSquadre.find(x => x.teamA === player.SquadraDiA.toLowerCase()).scores
    let teamScore = this.datiSquadre[player.SquadraDiA.toLowerCase()]

    if (teamScore) {
      return teamScore.find(x => x.voto && parseInt(x.id) === player.IDGazzetta)
    } else if (player.SquadraDiA && player.SquadraDiA.toLowerCase() !== 'serieminore' && force) {
      sails.log.info(`${player.Nome} 6 politico`)
      return {
        nome: this.getLastName(player),
        voto: 6,
        goals: 0,
        autogoals: 0,
        assists: 0,
        ammonizioni: 0,
        espulsioni: 0,
        failedPenalties: 0,
        penalties: 0,
        forcedScore: true
      }
    } else {
      sails.log.warn(`Team ${player.SquadraDiA} didn't play yet`)
      return null
    }
  }

  this.findSubstitutePlayer = function (player, standing, force = false) {
    for (var x = 11; x < standing.length; x++) {
      var substitute = standing[x]

      if (player.Ruolo === substitute.Ruolo &&
          // se il 1o e 2o portiere non giocano, usa il 3o
          (substitute.pos < 100 || player.Ruolo === 1) &&
          !this.reservePlayersUsed[substitute.Nome]) {

        var score = this.findPlayerScore(substitute, force)
        if (score) {
          this.reservePlayersUsed[substitute.Nome] = true
          standing[x] = player
          return [substitute, score]
        }
      }
    }
  }

  this.getScore = function (formazione, force=false) {
    var score = 0
    var bonus = 0
    var autogol = 0
    var standing = []
    let scorers = []
    let autoScorers = []

    for (var i in formazione) {
      let p = formazione[i]
      let player = this.findPlayerScore(p, force)

      if (player === null && i < 11) {
        // the player's team didn't play
        let [ oldPlayer, newPlayer ] = this.findSubstitutePlayer(p, formazione, force)
        if (newPlayer && oldPlayer) {
          player = newPlayer
          player.substituted = p.Nome
          p = oldPlayer
        } else {
          p.fantaVoto = 'SV'
        }
      } else if ((player === undefined ||
          (player && player.voto === 0)) && i < 11) {
        // the player didn't play, his team did
        // or the player played but the score is 0 (played few minutes)
        let x = this.findSubstitutePlayer(p, formazione, force)
        sails.log.verbose(`Player ${p.Nome} (#${p.id}, R${p.Ruolo}) didn't play`)
        if (x) {
          sails.log.verbose('sub is', x[1].nome)
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
        p.lastName = player.nome
        p.substituted = player.substituted
        p.events = player.evento ? player.evento.split(',') : []
        p.voto = player.voto
        p.fantaVoto = this.getFantaVoto(player, p.Ruolo)
        p.forcedScore = player.forcedScore
        if (!p.voto) { p.voto = null }
        if (!p.fantaVoto) { p.fantaVoto = 'SV' }

        p.goals = (player.goals > 0) ? player.goals : 0
        p.autogoals = player.autogoals

        if (!player.forcedScore) {
	        this.allPlayersScores.push({
	          lastName: p.lastName,
	          season,
	          day,
	          player: p.id,
	          // role will be removed before saving
	          role: p.Ruolo,
	          voto: p.voto,
	          fantaVoto: p.fantaVoto,
	          goals: p.goals,
	          // for album
	          hasPlayed: (i < 11) && !!p.voto,
	          expulsions: player.espulsioni,
	          admonitions: player.ammonizioni
	        })
        }
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

      if (i < 11) {
        score += p.goals
        autogol += p.autogoals
        bonus += (p.fantaVoto !== 'SV') ? p.fantaVoto : 0
        sails.log.verbose(`${p.Nome}: ${p.fantaVoto} G${p.goals} AG${p.autogoals}`)

        if (p.goals) {
          let scorer = p.lastName
          if (p.goals > 1) {
            scorer += ` (${player.goals})`
          }
          scorers.push(scorer)
        }

        if (p.autogoals) {
          autoScorers.push(`${p.lastName} (AG)`)
        }
      }

      sails.log.info(`${p.lastName} ${p.fantaVoto}`)
      standing.push(p)
    }

    const playersByCost = _.sortByAll(
      standing.slice(1,11).filter(p => !!p.voto && !p.forcedScore),
      [ 'fantaVoto', 'cost' ])

    if (bonus <= 59.5) {
      // Additional autogol based on bonus
      const malusGoals = Math.floor((64.5 - bonus) / 5)
      autogol += malusGoals
      for (let i = 0; i < malusGoals; i++) {
        scorers.push(`${playersByCost.shift().lastName} (AG/M)`)
      }
    } else if (bonus >= 67.5) {
      // Additional gol based on bonus
      const bonusGoals = Math.floor((bonus - 64.5) / 3)
      score += bonusGoals
      for (let i = 0; i < bonusGoals; i++) {
        const bonusScorer = playersByCost.pop()
        scorers.push(`${bonusScorer.lastName} (B)`)

        // update goals stats for the player
        this.allPlayersScores.find(p => p.player === bonusScorer.id).goals += 1
      }
    }

    return { score, bonus, autogol, standing, scorers, autoScorers }
  }

  this.sortStanding = function (standing) {
    for (let player of standing.players) {
      player.pos = standing.playersPositions.find(x => x.id === player.id).pos
    }

    return _.sortBy(standing.players, 'pos')
  }

  this.getLastName = function (player) {
    if (player.lastName) {
      // If last name is already set, use it
      return player.lastName
    } else {
      // Take only the UPPERCASE part of the full name
      return getLastName(player.Nome)
    }
  }
}
