const fs = require('fs')
const path = require('path')
const readline = require('readline')

const RE_INCONTRO = /a\[\d+\]=new I\(\d+,\d+,\d+,\d+,(\d+),xc\d+,\d+,xc\d+,(\d+),xc\d+,\d+,(\d+),(\d+)/

// Map team ID from FCM to SAILS SQL DB
const TEAMS_MAP = [
  null,
  5, // (1,"Potemkin Team","Belloli Roberto","","","","",0,33)
  4, // (2,"Stalla Rossa F.C.","Amicabile Luca","","","","",0,0)
  8, // (3,"Panchester UNT","Cacioppo Diego","","","","",0,0)
  2, // (4,"Lupentinus F.C.","Di Gioia Luca","","","","",0,0)
  3, // (5,"Scarsenal","Antonelli Federico","","","","",0,1)
  1, // (6,"Real Pier","Arrighini Piercarlo","","","","",0,27)
  9, // (7,"Horny Team","Brunelli Giuseppe","","","","",0,0)
  10, // (8,"Attimpuri","Rossi Attilio","","","","",0,3)
  11, // (9,"Ginentus F.C.","Bignetti Pietro","","","","",0,8)
  13, // (10,"Fanta Sappino","D'Intinosante Giulio","","","","",0,21)
]

module.exports = {

  friendlyName: 'Create Incontri',

  description: '',

  inputs: {
  },

  fn: async function () {
    let rlDetails = readline.createInterface({
      input: fs.createReadStream('./.tmp/js/fcmCalendarioDati.js')
    })

    for await (const line of rlDetails) {
      const m = line.match(RE_INCONTRO)
      if (m) {
        await FantaIncontro.create({
          IDFantagiornata: parseInt(m[1]) - 132,
          teamHome: TEAMS_MAP[m[3]],
          teamAway: TEAMS_MAP[m[4]],
          season: 2019
        })
      }
    }
  }
}
