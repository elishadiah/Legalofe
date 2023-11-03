module.exports = {


  friendlyName: 'Statistiche',


  description: 'Statistiche calciatori',


  inputs: {

  },


  exits: {
    success: {
      viewTemplatePath: 'pages/stats',
    }
  },


  fn: async function (inputs) {

    return {
      title: 'Statistiche',
      album: await Album
        .find({ season: this.req.league.season })
        .populate('team')
        .populate('player')
    }
  }
};
