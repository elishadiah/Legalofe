const axios = require('axios')
const $ = require('cheerio')
const { URL } = require('url')
const ProgressBar = require('progress')

module.exports = {
  friendlyName: 'Update stats',

  description: '',

  inputs: {
    year: { type: 'number', required: true }
  },

  fn: async function (inputs, exits) {
    sails.log('Running custom shell script... (`sails run update-stats`)');

    const STATS_URL = `https://www.gazzetta.it/calcio/fantanews/statistiche/serie-a-${inputs.year}-${inputs.year+1-2000}/`
    sails.log('Scraping', STATS_URL)

    const response = await axios.get(STATS_URL, {}, { charset: 'latin1' })
    const count = await parsePlayersDb(response.data)
    // sails.log(`Found ${count} players`)

    return exits.success()
  }
}

async function parsePlayersDb(html) {
  let allPlayers = []

  const rows = $('.magicDayListStats table.playerStats tbody tr', html)
  if (!rows.length) {
    sails.log.warn('No players found')
  }

  rows.each((i, player) => {
    const nameField = $('.field-giocatore a', player)

    const stats = $('td', player)

    allPlayers.push({
      id: parseInt(new URL(nameField.attr('href')).pathname.replace(/^\/|\/$/g, '').split('/').pop()),
      name: nameField.text().slice(0, -3).toLowerCase(),
      cost: stats.eq(4).text()
    })
  })

  const bar = new ProgressBar('  [:bar] :current/:total :etas', {
    total: allPlayers.length,
    incomplete: ' ',
    width: 30
  })

  let updatedPlayers = 0
  for (let player of allPlayers) {
    if (!player.id) {
      sails.log.warn(`Player ${player.name} has no id`)
      continue
    }

    const playerFound = await Player.updateOne({ IDGazzetta: player.id })
      .set({ cost: player.cost })

    bar.tick()

    if (playerFound) {
      updatedPlayers++
      // sails.log(`Player ${player.name} ${player.id} $${player.cost}`)
    } else {
      sails.log.warn(`Player ${player.name} ${player.id} $${player.cost} not found`)
    }
  }

  sails.log(`Updated ${updatedPlayers}/${allPlayers.length} players`)

  return allPlayers
}
