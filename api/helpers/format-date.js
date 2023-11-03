module.exports = {


  friendlyName: 'Format date',


  description: '',

  sync: true,

  inputs: {
    date: { type: 'string', required: true }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: function (inputs) {
    const MESI = [ 'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic' ]
    const GIORNI = [ 'Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab' ]

    const date = new Date(inputs.date)

    return `${GIORNI[date.getDay()]} ${date.getDate()} ${MESI[date.getMonth()]} ${date.getFullYear()}`
  }


};

