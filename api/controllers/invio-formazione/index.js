module.exports = {


  friendlyName: 'Index',


  description: 'Index invio formazione.',


  inputs: {

  },


  exits: {
    success: {
      viewTemplatePath: 'pages/invio-formazione',
    }
  },


  fn: async function () {
    let IDFantagiornata
    let teamId = parseInt(this.req.param('team'))

    if (!teamId && this.req.me.team) {
      teamId = this.req.me.team.id
    }

    let players = []
    let match = null

    if (teamId) {
      players = await Player.find({
        where: { IDSquadra: teamId },
        sort: [ { Ruolo: 'ASC' }, { Nome: 'ASC' } ]
      })

      const album = await Album.find({
        season: this.req.league.season,
        team: teamId
      })

      for (let player of players) {
        player.album = album.find(x => x.player === player.id)
      }

      // url query param takes precedence
      IDFantagiornata = parseInt(this.req.param('Gio'))

      // then the next day
      if (!IDFantagiornata && this.req.league.nextFantagiornata) {
        const nextFantagiornata = (await FantaGiornata.find({
          where: { date: { '>=': new Date().toISOString().slice(0, 10) } },
          sort: [ { date: 'ASC' } ],
          limit: 1
        }))[0]

        IDFantagiornata = nextFantagiornata ? nextFantagiornata.id : null
      }

      match = IDFantagiornata ? await FantaIncontro
        .findOne({
          where: {
            IDFantagiornata,
            or: [
              { teamHome: teamId },
              { teamAway: teamId }
            ]
          }
        })
        .populate('IDFantagiornata')
        .populate('teamHome')
        .populate('teamAway') : null
    }

    const allFantaGiornate = await FantaGiornata.find({
      where: {
        season: this.req.league.season,
        day: { '>': 0 },
        locked: false
      },
      sort: [ 'girone ASC', 'day ASC' ],
      limit: 100
    })

    return {
      title: 'Invio Formazione',
      teamId,
      players,
      match,
      allFantaGiornate,
      fantaGiornata: allFantaGiornate.find(fg => fg.id === IDFantagiornata)
    }
  }
};
