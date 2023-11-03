/**
 * PlayerController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  list: async function (req, res) {
    const SQL_ALL_TEAMS = 'SELECT DISTINCT SquadraDiA FROM player ORDER BY SquadraDiA;'

    const allTeams = await Player.getDatastore().sendNativeQuery(SQL_ALL_TEAMS)

    return res.view('pages/quotazioni', { allTeams: allTeams.rows })
  },

  transfer: async function (req, res) {
    const cost = parseInt(req.param('cost'))

    const player = await Player.findOne(req.param('id'))
    await Player.updateOne(req.param('id'), {
      IDSquadra: req.param('team'),
      cost
    })

    const albumUpdated = await Album.updateOne({
      season: req.league.season,
      player: req.param('id')
    }, {
      team: req.param('team'),
      cost
    })

    if (!albumUpdated) {
      await Album.create({
        season: req.league.season,
        player: req.param('id'),
        team: req.param('team'),
        teamA: player.SquadraDiA,
        cost
      })
    }

    // If the player is transferred to another team, then take credits from the team
    if (req.param('team')) {
      const toTeam = await Team.findOne(req.param('team'))

      if (toTeam.credits < cost) {
        return res.error(`${toTeam.name} non ha crediti sufficienti per l'acquisto del giocatore`)
      }

      await Team.updateOne(toTeam.id, {
        credits: toTeam.credits - cost
      })
    }

    // If the player is transferred from a team, then refund credits to the team
    if (player.IDSquadra) {
      const fromTeam = await Team.findOne(player.IDSquadra)
      await Team.updateOne(fromTeam.id, {
        credits: fromTeam.credits + cost
      })
    }

    return res.send({})
  }
}
