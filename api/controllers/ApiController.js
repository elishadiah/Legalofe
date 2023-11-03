/**
 * AdminController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  listTeams: async (req, res) => {
    var lega = await Lega.findOne({
      active: 1,
    });

    var classificaTeams = await Classifica.find({
      select: ["team"],
      where: {
        season: lega.season,
        girone: lega.girone
      },
    }).sort("points DESC");

    var newLegaTeams = [];

    for (var i = 0; i < 8; i++) {
      let team = await Team.findOne({
        id: classificaTeams[i].team,
      });
      newLegaTeams.push(team);
    }

    res.json({
      teams: newLegaTeams,
    });
  },

  createLeague: async (req, res) => {
    var newLega = await Lega.create({
      name: req.body.lega.name,
      season: req.body.lega.season,
      day: req.body.lega.day,
      totalMatches: req.body.lega.totalMatches,
      active: 0,
      girone: 1,
    }).fetch();

    console.log(req.body.teams);

    const teamIds = req.body.teams.map((t) => t.id);

    await Lega.addToCollection(newLega.id, "teams").members(teamIds);

    res.json({
      status: true,
    });
  },
};
