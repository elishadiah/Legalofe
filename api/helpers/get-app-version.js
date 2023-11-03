const package = require('../../package.json')

module.exports = {


  friendlyName: 'Get app version',


  description: '',

  sync: true,

  inputs: {

  },


  exits: {

    success: {
      outputFriendlyName: 'App version',
    },

  },


  fn: function () {
    return package.version
  }
};

