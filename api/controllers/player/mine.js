module.exports = {


  friendlyName: 'Mine',


  description: 'Mine player.',


  inputs: {

  },


  exits: {
    notLoggedIn: {
      description: 'That email address and password combination is not recognized.',
      responseType: 'unauthorized'
    }
  },


  fn: async function (inputs, exits) {
    if (!this.req.me) {
      return exits.notLoggedIn()
    }

    const players = await Player.find({
      where: { IDSquadra: this.req.me.team.id },
      sort: [ { Ruolo: 'ASC' }, { Nome: 'ASC' } ]
    })

    return this.res.json(players)

  }


};
