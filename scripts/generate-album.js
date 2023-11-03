const ProgressBar = require('progress')

module.exports = {
  friendlyName: 'Generate album',

  description: '',

  inputs: {
    season: {
      type: 'number',
      required: true
    }
  },

  fn: async function (inputs) {
    const PAGE_SIZE = 30
    const howMany = await Player.count({ IDSquadra: { '>': 0 } })

    const bar = new ProgressBar('  [:bar] :current/:total :etas', {
      total: howMany,
      incomplete: ' ',
      width: 30
    })

    for (let i = 0; i < howMany; i += PAGE_SIZE) {
      const players = await Player.find({
        where: { IDSquadra: { '>': 0 } },
        sort: 'id ASC',
        limit: PAGE_SIZE,
        skip: i
      })

      let data
      let updated
      for (const p of players) {
        data = {
          player: p.id,
          team: p.IDSquadra,
          teamA: p.SquadraDiA,
          season: inputs.season,
          cost: p.cost,
          firstDay: 0,
          presences: 0,
          totalScores: 0,
          totalFantaVoti: 0,
	        goals: 0,
          expulsions: 0,
          admonitions: 0
        }

        // If the player album for that season exists, updates it
        updated = await Album
          .updateOne({
            player: data.player,
            season: data.season
          })
          .set(data)

        if (!updated) {
          await Album.create(data)
        }

        bar.tick()
      }
    }
  }
}
