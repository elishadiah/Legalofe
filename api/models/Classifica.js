/**
 * Classifica.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
    points: { type: 'number' },
    team: { model: 'team', required: true },
    girone: { type: 'number', required: true },
    season: { type: 'number', required: true },
    day: { type: 'number' },
    competizione: { type: 'number' },

    wonHome: { type: 'number' },
    wonAway: { type: 'number' },
    drawnHome: { type: 'number' },
    drawnAway: { type: 'number' },
    lostHome: { type: 'number' },
    lostAway: { type: 'number' },

    goalsHome: { type: 'number' },
    goalsAway: { type: 'number' },
    goalsAgainstHome: { type: 'number' },
    goalsAgainstAway: { type: 'number' },

    MI: { type: 'number' },
    totalAvg: { type: 'number' },
    totalMin: { type: 'number' },
    totalMax: { type: 'number' },
    totalDev: { type: 'number' },
    totalTot: { type: 'number' },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

  },

};

