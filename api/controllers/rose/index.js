module.exports = {


  friendlyName: 'Rose',


  description: 'Rose something.',


  inputs: {

  },


  exits: {
    success: {
      viewTemplatePath: 'pages/rose',
    }
  },


  fn: async function () {
    const teamId = this.req.param('team')

    let album = await Album
      .find({ team: teamId, season: this.req.league.season })
      .populate('player')
      .populate('team')

    album = _.sortBy(album, 'player.Ruolo')

    for (let entry of album) {
      entry.pastYears = await Album
        .find({ player: entry.player.id })
        .sort('season DESC')
        .populate('team')
    }

    const mostPayed = _.sortBy(album, 'player.payed').reverse().slice(0,10).filter(x => x.player.payed > 0)

    const mostPresent = _.sortBy(album, 'presences').reverse().slice(0,10).filter(x => x.presences > 0)

    const mostScored = _.sortBy(album, 'goals').reverse().slice(0,10).filter(x => x.goals > 0)

    return {
      album,
      team: await Team.findOne(teamId).populate('manager'),
      mostPayed,
      mostPresent,
      mostScored
    }
  }
};
