/**
 * FantaIncontro.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
    IncAcc: { type: 'number' },
    Tipo: { type: 'number' },
    IDFantagiornata: { model: 'FantaGiornata', required: true },
    GiornataDiA: { type: 'number' },
    Giocato: { type: 'boolean' },
    IDCompetizione: { type: 'number' },
    IDGirone: { type: 'number' },
    season: { type: 'number', required: true },
    // "Fantagiornata": "1a Camp. (Andata)",
    // "Competizione": "Campionato de Apertura",
    // "Girone": "Campionato de Apertura",

    teamHome: { model: 'team', required: true },
    teamAway: { model: 'team', required: true },
    legaHome: { type: 'number' },
    legaAway: { type: 'number' },
    goalsHome: { type: 'number' },
    goalsAway: { type: 'number' },
    scorersHome: { type: 'string' },
    scorersAway: { type: 'string' },
    partialHome: { type: 'number' },
    partialAway: { type: 'number' },
    totalHome: { type: 'number' },
    totalAway: { type: 'number' }

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

  },

};

