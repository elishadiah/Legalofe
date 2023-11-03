module.exports = {
  friendlyName: 'Update ranking',
  description: '',

  inputs: {
    season: {
      type: 'number'
    },
    girone: {
      type: 'number'
    }
  },

  fn: async function (inputs) {
    const days = await FantaGiornata.find({
      season: inputs.season,
      girone: inputs.girone
    })
    .populate('matches')

    const teams = await Team.find()

    const ranking = {}

    for (let day of days) {
      for (let match of day.matches) {
        if (!match.Giocato) { continue }

        if (!ranking[match.teamHome]) { ranking[match.teamHome] = 0 }
        if (!ranking[match.teamAway]) { ranking[match.teamAway] = 0 }

        if (match.goalsHome > match.goalsAway) {
          ranking[match.teamHome] += 3
        } else if (match.goalsHome < match.goalsAway) {
          ranking[match.teamAway] += 3
        } else {
          ranking[match.teamHome] += 1
          ranking[match.teamAway] += 1
        }
      }
    }

    for (let teamId in ranking) {
      sails.log.info(teams.find(t => t.id === parseInt(teamId)).name + ' -> ' + ranking[teamId])
    }
  }
}
