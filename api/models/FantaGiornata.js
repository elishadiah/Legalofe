/**
 * FantaGiornata.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    season: { type: 'number', required: true },
    girone: { type: 'number', required: true },
    day: { type: 'number', required: true },
    daySerieA: { type: 'number', required: true },
    date: { type: 'string', required: true },
    deadline: { type: 'string' },
    locked: { type: 'boolean' },
    calculated: { type: 'boolean' },
    matches: {
      collection: 'FantaIncontro',
      via: 'IDFantagiornata'
    }
  }
}
