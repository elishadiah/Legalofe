const scrapeGdS = require('./scrapeGdS')
const MatchScores = require('./MatchScores')

module.exports = async function (inputs) {
  /* Steps:
   *  Leggi formazione giornata N
   *  Leggi classifica giornata N-1
   *  Calcola risultati giornata N
   *  Genera delta classifica da N-1 a N
   *  Salva classifica giornata N
   *  Aggiorna Album gicoatori (presenze, ammonizioni, etc.)
   *  Calcola top e flop
   */
  sails.log.info('Running custom shell script... (`sails run update-classifica-js`)')

  if (inputs.dryRun) {
    sails.log.warn('Dry Run: not actual writes to DB!')
  }

  let league
  let fantaGiornataId

  if (!inputs.day) {
    // get the current season
    league = await Lega
      .findOne({ active: true })
      .populate('fantagiornata')
      .populate('nextFantagiornata')
      .populate('teams')

    fantaGiornataId = league.nextFantagiornata.id
  } else {
    fantaGiornataId = inputs.day
    sails.log.info(`Giornata da arg --day ${fantaGiornataId}`)
  }

  if (!fantaGiornataId) {
    sails.log.error('Campionato terminato o arg --day null')
    throw new Error('Campionato terminato o arg --day null')
  }

  // Get date of the next match
  const nextMatch = await FantaGiornata.findOne(fantaGiornataId)
  const nextMatchDate = new Date(nextMatch.date)
  sails.log.info(`Calcolo giornata #${nextMatch.day} (Serie A #${nextMatch.daySerieA}) del ${nextMatchDate}`)

  if (nextMatchDate > new Date()) {
    sails.log.info('Giornata non ancora giocata')
    throw new Error('Giornata non ancora giocata')
  }

  // in case of fantagiornata ID provided via inputs.day
  if (!league) {
    league = await Lega.findOne({ season: nextMatch.season })
      .populate('fantagiornata')
      .populate('nextFantagiornata')
      .populate('teams')
  }

  // Trova incontri della giornata
  const incontri = await FantaIncontro
    .find({
      IDFantagiornata: fantaGiornataId
    })
    .populate('teamHome')
    .populate('teamAway')

  if (incontri.every(i => i.Giocato)) {
    throw new Error('Giornata già calcolata')
  }

  // Download voti GdS
  let scoreGdS = await scrapeGdS.scrapeScores(nextMatch.season, nextMatch.daySerieA);

  // User provided results
  scoreGdS = Object.assign(scoreGdS, inputs.scores)
  for (let teamA in inputs.scores) {
    await Scores.create({
      season: nextMatch.season,
      day: nextMatch.daySerieA,
      teamA,
      scores: inputs.scores[teamA],
      source: 'gds'
    })
  }

  const publishedScores = Object.keys(scoreGdS).length

  if (publishedScores !== 20 && !inputs.force) {
    sails.log.info(`Voti GdS parzialmente pubblicati: ${publishedScores} / 20`);
    throw new Error(`Voti GdS parzialmente pubblicati: ${publishedScores} / 20`);
  }

  if (inputs.force) {
    sails.log.info('6 politico per squadre che non hanno giocato')
  }

  let matches = new MatchScores(nextMatch.season, fantaGiornataId)

  // Leggi formazioni
  const formazioni = await Formazione
    .find({
      day: fantaGiornataId
    })
    .populate('players')

  // Load scores
  matches.datiSquadre = scoreGdS
  const scores = matches.updateMatchScores(formazioni, incontri, inputs.force)

  // Top / Flop 11
  const TOP_FLOP_11_STANDING = [ 1, 5, 4, 3 ]

  // create top flop 11
  for (let type of [ 'top', 'flop' ]) {
    let topFlop11 = []

    TOP_FLOP_11_STANDING.forEach((count, i) => {
      const role = i + 1

      let playersByRole = matches.allPlayersScores.filter(x => x.role === role)
      playersByRole = _.sortBy(playersByRole, 'fantaVoto')
      if (type === 'top') {
        playersByRole.reverse()
      }
      playersByRole = playersByRole.slice(0, count)

      // Sails Waterline ORM bug
      // copy data otherwise createEach modify the objects in the array
      const toWrite = []
      playersByRole.forEach(x => {
        toWrite.push({
          type,
          season: x.season,
          day: x.day,
          player: x.player,
          voto: x.voto,
          fantaVoto: x.fantaVoto,
          goals: x.goals
        })
      })

      topFlop11 = [ ...topFlop11, ...toWrite ]
    })

    if (!inputs.dryRun) {
      // remove topflop of the same day, if any
      await TopFlop.destroy({ day: fantaGiornataId, type })
      await TopFlop.createEach(topFlop11)
    }

    // sails.log.info(type, '11')
    // sails.log.info(topFlop11)
  }

  /**
   * Update classifica and incontri
   *
   * Calcola delta e salva la nuova classifica e incontri
   */
  for (let i = 0; i < incontri.length; i++) {
    if (!scores[i].home || !scores[i].away) {
      sails.log.warn(`Skip match ${incontri[i].teamHome.name} vs ${incontri[i].teamAway.name} as teams didn't play`)
      continue
    }

    for (let casa of [true, false]) {
      let delta = generateRankingDelta(scores[i], casa)
      const team = casa ? incontri[i].teamHome : incontri[i].teamAway

      let classifica = await Classifica.findOne({
        season: nextMatch.season,
        team: team.id,
        girone: nextMatch.girone
      })

      // nuovo campionato oppure cambio di girone
      if (!classifica) {
        classifica = {
          season: nextMatch.season,
          team: team.id,
          girone: nextMatch.girone
        }
      }

      applyRankingDelta(classifica, delta)
      sails.log.info(`${team.name} P.ti ${classifica.points}, Delta: ${delta.points}`)

      // Adjust fields to create new entry
      delete classifica.id
      delete classifica._id
      delete classifica.createdAt
      delete classifica.updatedAt
      classifica.girone = nextMatch.girone

      if (!inputs.dryRun) {
        if (!inputs.skipRanking) {
          let exists = await Classifica
            .updateOne({
              season: league.season,
              team: team.id,
              girone: nextMatch.girone
            })
            .set(JSON.parse(JSON.stringify(classifica)))
          if (!exists) {
            await Classifica.create(JSON.parse(JSON.stringify(classifica)))
          }
        } else {
          sails.log.info('[--skipRanking] Skip ranking update')
        }
      } else {
        sails.log.info('[--dryRun] Update or Create Classifica')
      }
      // sails.log.info(classifica)
    }
    applyMatchesDelta(incontri[i], scores[i])

    incontri[i].teamHome = incontri[i].teamHome.id
    incontri[i].teamAway = incontri[i].teamAway.id
    delete incontri[i].createdAt
    delete incontri[i].updatedAt
    if (!inputs.dryRun) {
      await FantaIncontro.updateOne(incontri[i].id).set(JSON.parse(JSON.stringify(incontri[i])))
    } else {
      sails.log.info('[--dryRun] Update FantaIncontro')
    }
    sails.log.info(incontri[i])
  }

  // Update players Album
  sails.log.info('## Update Album')

  let album
  let albumUpdate
  let albumCount = 0

  for (const player of matches.allPlayersScores) {
    if (!player.hasPlayed) {
      sails.log.info(`${player.lastName} didn't play`)
      continue
    }

    album = await Album.findOne({ player: player.player, season: player.season })
    albumUpdate = {
      firstDay: album.firstDay ? album.firstDay : nextMatch.day,
      presences: album.presences + 1,
      totalScores: album.totalScores + player.voto,
      totalFantaVoti: album.totalFantaVoti + player.fantaVoto,
      goals: album.goals + player.goals,
      expulsions: album.expulsions + player.expulsions,
      admonitions: album.admonitions + player.admonitions
    }

    albumCount++

    if (!inputs.dryRun) {
      const updated = await Album
        .updateOne(album.id)
        .set(albumUpdate)

      if (!updated) {
        sails.log.warn('Error updating album', albumUpdate)
      }
    }
    sails.log.info(`${player.lastName} P${albumUpdate.presences} G${albumUpdate.goals}`)
  }
  sails.log.info(`Stats aggiornate per ${albumCount}/${matches.allPlayersScores.length} giocatori`)

  // Giornata calcolata con successo
  await FantaGiornata.updateOne(nextMatch.id, {
    calculated: true
  })

  // Ora bisogna aggiornare fantagiornata e nextFantagiornata
  // Se la giornata calcolata è via arg --day, non aggiornare la lega
  if (!inputs.dryRun && !inputs.day) {
    const nextFantagiornata = await findNextFantagiornata(league)

    if (nextFantagiornata) {
      sails.log.info('Next FG', nextFantagiornata)
    } else {
      sails.log.warn('Prossima FantaGiornata non trovata: campionato terminato o errore')
    }

    await Lega.updateOne(league.id).set({
      fantagiornata: league.nextFantagiornata ? league.nextFantagiornata.id : null,
      nextFantagiornata: nextFantagiornata ? nextFantagiornata.id : null
    })
  } else {
    sails.log.info('[--dryRun or --skipRanking] Update Lega')
  }

  if (!inputs.dryRun) {
    for (const team of league.teams) {
      const manager = await User.findOne(team.manager)

      await sails.helpers.sendTemplateEmail.with({
        to: manager.emailAddress,
        subject: 'Classifica Aggiornata!',
        template: 'email-classifica-aggiornata',
        templateData: {
          giornata: nextMatch.day,
          league
        }
      })

      sails.log.info('sent email to', manager.emailAddress)
    }

    await sails.helpers.sendTemplateEmail.with({
      to: 'luca.faggianelli@gmail.com',
      subject: 'Classifica Aggiornata!',
      template: 'email-classifica-aggiornata',
      templateData: {
        giornata: nextMatch.day,
        league
      }
    })

    sails.log.info('sent email to Luca F.')
  } else {
    sails.log.info('[--dryRun or --skipRanking] Send Mail')
  }
}

function applyMatchesDelta (incontro, score) {
  incontro.goalsHome = score.home.score
  incontro.goalsAway = score.away.score
  incontro.scorersHome = score.home.scorers.join(', ')
  incontro.scorersAway = score.away.scorers.join(', ')

  incontro.partialHome = score.home.bonus
  incontro.partialAway = score.away.bonus
  incontro.totalHome = score.home.bonus
  incontro.totalAway = score.away.bonus
  incontro.Giocato = true
}

function applyRankingDelta (entry, delta) {
  const matchesCount = ((entry.wonHome + entry.wonAway +
    entry.drawnHome + entry.drawnAway +
    entry.lostHome + entry.lostAway) || 0) +
    1 // this match

  for (let i in delta) {
    if (i.endsWith('Min')) {
      entry[i] = Math.min(entry[i] || Infinity, delta[i] || Infinity)
    } else if (i.endsWith('Max')) {
      entry[i] = Math.max(entry[i] || -Infinity, delta[i] || -Infinity)
    } else if (i.endsWith('Avg')) {
      entry[i] = parseFloat((
        // Ceiling formula for dual championship ranking
        (entry[i] || 0) + (delta[i] - (entry[i] || 0)) / matchesCount
      ).toFixed(3))
    } else {
      entry[i] = (entry[i] || 0) + (delta[i] || 0)
    }
  }
}

function generateRankingDelta (match, inCasa) {
  let MI
  if (inCasa) {
    if (match.home.score > match.away.score) { MI = 0 }
    else if (match.home.score === match.away.score) { MI = -2 }
    else { MI = -3 }
  } else {
    if (match.away.score > match.home.score) { MI = 2 }
    else if (match.away.score === match.home.score) { MI = 0 }
    else { MI = -1 }
  }

  return {
    points: (match.away.score === match.home.score) ? 1 :
      (inCasa ? (match.home.score > match.away.score) * 3 :
                (match.away.score > match.home.score) * 3),

    wonHome: (inCasa && (match.home.score > match.away.score)) * 1,
    wonAway: (!inCasa && (match.away.score > match.home.score)) * 1,
    drawnHome: (inCasa && (match.home.score === match.away.score)) * 1,
    drawnAway: (!inCasa && (match.away.score === match.home.score)) * 1,
    lostHome: (inCasa && (match.home.score < match.away.score)) * 1,
    lostAway: (!inCasa && (match.away.score < match.home.score)) * 1,

    goalsHome: inCasa * (inCasa ? match.home.score : match.away.score),
    goalsAway: !inCasa * (inCasa ? match.home.score : match.away.score),
    goalsAgainstHome: inCasa * (inCasa ? match.away.score : match.home.score),
    goalsAgainstAway: !inCasa * (inCasa ? match.away.score : match.home.score),

    MI,
    totalAvg: inCasa ? match.home.bonus : match.away.bonus,
    totalMin: inCasa ? match.home.bonus : match.away.bonus,
    totalMax: inCasa ? match.home.bonus : match.away.bonus,
    totalTot: inCasa ? match.home.bonus : match.away.bonus
  }
}

async function findNextFantagiornata ({ nextFantagiornata, totalMatches, season }) {
  // in this moment nextFantagiornata becomes the current day,
  // so we need to find the next of next...

  let nextDay = 0
  let nextGirone = 0

  if (!nextFantagiornata) {
    // it's already over! stop polling
    sails.log.warn('il campionato è terminato, ferma CRON')
    return null
  } else if (nextFantagiornata.day < totalMatches) {
    // Normal day and first day handled here
    nextDay = nextFantagiornata.day + 1
    nextGirone = nextFantagiornata.girone
  } else if (nextFantagiornata.girone < 2) {
    // Last day of 1st girone
    nextDay = 1
    nextGirone = nextFantagiornata.girone + 1
  } else {
    // Last day of last girone, end of league
    return null
  }

  const next = await FantaGiornata.findOne({
    day: nextDay,
    girone: nextGirone,
    season
  })

  return next
}
