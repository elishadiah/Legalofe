#!/usr/bin/env node

// ./scrapGazzetta.js <score, standings> <year> <day>

const axios = require('axios')
const $ = require('cheerio')
const { URL } = require('url')
const { writeJson } = require('./helpers')

const cmd = process.argv[2]
const year = parseInt(process.argv[3])
const day = parseInt(process.argv[4])

const STANDINGS_URL = 'https://www.gazzetta.it/Calcio/prob_form'

function parseProbableStandings(html) {
  // Get match day from the page as the URL point always to latest
  const matchDay = $('.mainHeading h3', html).text()
      .match(/^(\d+)/).pop()

  let allStandings = {}

  $('.matchFieldContainer', html).each((i, match) => {
    const teamNames = [
      $('.homeTeam .teamName a', match).text(),
      $('.awayTeam .teamName a', match).text()
    ]

    $('.team-players-inner', match).each((j, standing) => {
      allStandings[teamNames[j]] = {
        players: [],
        reserves: [],
        unavailables: []
      }

      $('.team-player', standing).each((k, player) => {
        allStandings[teamNames[j]].players.push($(player).text())
      })
    })

    const details = [
      $('.homeDetails p', match),
      $('.awayDetails p', match)
    ]

    for (let i in details) {
      allStandings[teamNames[i]].reserves = parsePlayerList(details[i].eq(0).text())
          .map(x => x.match(/^\s*(?:\S+)\s+(.*)/).pop())

      allStandings[teamNames[i]].ballot = parsePlayerList(details[i].eq(1).text())
      allStandings[teamNames[i]].disqualified = parsePlayerList(details[i].eq(2).text())
      allStandings[teamNames[i]].unavailables = parsePlayerList(details[i].eq(3).text())
      allStandings[teamNames[i]].warned = parsePlayerList(details[i].eq(4).text())
    }
  })

  writeJson(allStandings, `./data/standings-gazzetta-${matchDay}.json`)
}

function parsePlayerList(str) {
  let list = str.split(':').pop().trim()

  if (list.toLowerCase().startsWith('nessuno')) {
    return []
  }

  // Sometimes the list end with a comma ,
  if (list.substr(list.length - 1) === ',') {
    list = list.slice(0, -1)
  }

  return list.split(',').map(x => x.trim())
}

async function parseGazzettaScores(html, year, day) {
  let allScores = {}
  let teamPlayed = false

  const teamTables = $('.magicDayList.listView .magicTeamList', html)
  let allTeamsCount = teamTables.length

  if (!allTeamsCount) {
    return allScores
  }

  teamTables.each(async (i, teamTable) => {
    const teamName = $('.teamNameIn', teamTable).text().toLowerCase()

    teamPlayed = false

    $('li', teamTable).each((j, player) => {
      // Skip first row, team name
      if (j === 0) { return true }

      const metrics = $('.inParameter', player)
      const name = $('.playerNameIn a', player)

      const p = {
        id: new URL(name.attr('href')).pathname.replace(/^\/|\/$/g, '').split('/').pop(),
        nome: name.text(),
        voto: parseFloat(metrics.eq(0).text()) || 0,
        goals: parseFloat(metrics.eq(1).text()) || 0,
        assists: parseFloat(metrics.eq(2).text()) || 0,
        penalties: parseFloat(metrics.eq(3).text()) || 0,
        failedPenalties: parseFloat(metrics.eq(4).text()) || 0,
        autogoals: parseFloat(metrics.eq(5).text()) || 0,
        ammonizioni: parseFloat(metrics.eq(6).text()) || 0,
        espulsioni: parseFloat(metrics.eq(7).text()) || 0,
        fantaVoto: parseFloat(metrics.eq(8).text()) || 0
      }

      // Team played if at least 1 player did
      teamPlayed = teamPlayed || !!p.voto
      if (teamPlayed) {
        if (!allScores[teamName]) { allScores[teamName] = [] }
        allScores[teamName].push(p)
      }
    })

    if (teamPlayed) {
      allTeamsCount--

      let exists = await Scores
        .updateOne({
          season: year,
          day,
          teamA: teamName
        })
        .set({
          scores: allScores[teamName]
        })

      if (!exists) {
        await Scores.create({
          season: year,
          day,
          teamA: teamName,
          scores: allScores[teamName]
        })
      }
    } else {
      console.log(`${teamName} non ha giocato`)
    }
  })

  return allScores
}

async function scrapeScores (year, day) {
  const SCORE_URL = `https://www.gazzetta.it/calcio/fantanews/voti/serie-a-${year}-${year+1-2000}/giornata-${day}`
  console.log('Scraping', SCORE_URL)

  const response = await axios.get(SCORE_URL, {}, { charset: 'latin1' })
  const scores = await parseGazzettaScores(response.data, year, day)

  return scores
}

switch (cmd) {
  case 'score':
    scrapeScores(year, day)
    break;

  case 'standings':
    axios.get(STANDINGS_URL, {}, { charset: 'latin1' })
        .then(response => parseProbableStandings(response.data))
        .catch(console.error)
    break;
}

module.exports = {
  scrapeScores
}

