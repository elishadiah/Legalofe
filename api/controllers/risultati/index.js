module.exports = {


  friendlyName: 'Index',


  description: 'Index risultati.',


  inputs: {

  },


  exits: {
    success: {
      viewTemplatePath: 'pages/risultati',
    }
  },


  fn: async function () {
    return { title: 'Risultati' }
  }
};
