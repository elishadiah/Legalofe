const calcolaGiornata = require('./calcolaGiornata')

/**
 * Crontab
 *  0 7-20 * * 1-3
 * same but everyday and each 2 hrs
 *  0 9-20/2 * * * cd fantalegalofe-sails/source; npx sails run scripts/updateClassifica.js
 *
 * At minute 0 past every hour from 7 through 20 on every day-of-week
 * from Monday through Wednesday.
 *
 * https://crontab.guru/#0_7-20_*_*_1-3
 */

module.exports = {
  friendlyName: 'Update classifica',

  description: 'Aggiorna classifica ed incontri in base ai voti di Gazzetta dello Sport',

  inputs: {
    dryRun: { type: 'boolean', defaultsTo: false },
    skipRanking: { type: 'boolean', defaultsTo: false },
    day: { type: 'number' }
  },

  exits: {
    notPlayed: {},
    scoreNotPublished: {},
    invalidArguments: {}
  },

  fn: calcolaGiornata
}
