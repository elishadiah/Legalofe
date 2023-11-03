module.exports = {


  friendlyName: 'Classifica',


  description: 'Mostra la classifica.',


  exits: {
    success: {
      viewTemplatePath: 'pages/classifica',
    }
  },


  fn: async function () {
    const classifica = await Classifica
      .find({
        where: {
          season: this.req.league.season,
          girone: Number(String(this.req.query.Gir || this.req.league.fantagiornata.girone).replace('>', ''))
        },
        sort: [ { points: 'DESC' } ]
      })
      .populate('team')

    for (let entry of classifica) {
      entry.team.manager = await User.findOne(entry.team.manager)
    }

    return { title: 'Classifica', classifica }
  }
};
