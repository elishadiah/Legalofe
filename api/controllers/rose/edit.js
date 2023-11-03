module.exports = {


  friendlyName: 'Rose',


  description: 'Rose something.',


  inputs: {

  },


  exits: {
    success: {
      viewTemplatePath: 'pages/rose-edit',
    }
  },


  fn: async function () {
    const teamId = this.req.param('team')

    return {
      team: await Team.findOne(teamId).populate('manager')
    }
  }
};
