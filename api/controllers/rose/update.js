const path = require('path')

module.exports = {


  friendlyName: 'Rose',


  description: 'Rose something.',


  inputs: {

  },


  exits: {
  },


  fn: async function () {
    const teamId = this.req.param('team')
    let logo

    if (this.req._fileparser.upstreams.length) {
      try {
        logo = await sails.uploadOne(this.req.file('logo'))
      } catch (err) {
        sails.error(err)
        return this.res.serverError(err);
      }
    }

    const data = {
      name: this.req.body.name
    }

    if (logo) {
      data.logo = path.basename(logo.fd)
    }

    await Team.updateOne(teamId, data)

    return this.res.redirect('/rose/' + teamId)
  }
};
