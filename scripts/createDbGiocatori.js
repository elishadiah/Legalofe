/**
 * Read fcmSerieADati.js and finds player names in the format of:
 *   xg706="ROMERO Cristian Gabriel"
 * and fcmSeriaADatiDettaglio.js with player details:
 *   a[448]=new GiocatoreA(333,16,4,100307,9,0)
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const { writeJson, getLastName } = require('./helpers')
const { getTeamNameById } = require(path.resolve(__dirname, './serieA2017.js'))
let giocatoriGazzetta
try {
  giocatoriGazzetta = require(path.resolve(__dirname, './players-gazzetta.json'))
} catch (e) {
  console.warn('DB giocatori gazzetta not found')
}

const RE_PLAYER_NAME = /xg(\d+)="(.+)"/
const RE_PLAYER_DETAILS = /a\[\d+\]=new GiocatoreA\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/
// a[1]=new R(1,1,xg130,xa16,0,0,1,11,0,0)
const RE_ROSA = /a\[\d+\]=new R\((\d+),(\d+),xg(\d+)/
const RE_BILANCIO = /a\[\d+\]=new B\(\d+,\w+\+xg(\d+)\+\w+,-(\d+),/

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

let giocatori = {}
let namesCount = 0
let detailsCount = 0
let idsCount = 0

module.exports = {

  friendlyName: 'Create players DB',

  description: '',

  inputs: {

  },

  fn: async function () {
    let rlDetails = readline.createInterface({
      input: fs.createReadStream('./.tmp/js/fcmSerieADatiDettaglio.js')
    })

    for await (const line of rlDetails) {
      const m = line.match(RE_PLAYER_DETAILS)
      if (m) {
        const teamName = getTeamNameById(m[2])
        if (!teamName) {
          console.warn(`Team with ID ${m[2]} not found, player ${m[1]}`)
        }

        // Detail fields (ID,IDSquadra,Ruolo,Codice,Crediti,Extracom)
        giocatori[m[1]] = {
          SquadraDiA: teamName,
          Ruolo: parseInt(m[3]),
          Codice: m[4],
          Crediti: m[5],
          Extracom: m[6]
        }
        detailsCount++
      }
    }

    await parseNames()
  }
}

async function parseNames () {
  let rli = readline.createInterface({
    input: fs.createReadStream('./.tmp/js/fcmSerieADati.js')
  })

  for await (const line of rli) {
    const m = line.match(RE_PLAYER_NAME)
    let id

    if (m) {
      if (giocatoriGazzetta) {
        id = giocatoriGazzetta[getLastName(m[2])] || null
        if (id) {
          idsCount++
        } else {
          console.log('player ID not found for', getLastName(m[2]))
        }
      }

      giocatori[m[1]].Nome = m[2]
      giocatori[m[1]].IDGazzetta = id
      namesCount++
    }
  }

  return parseRose()
}

// Associazione Giocatore <-> Fantasquadra
async function parseRose () {
  let rli = readline.createInterface({
    input: fs.createReadStream('./.tmp/js/fcmFantasquadreDati.js')
  })

  let m
  for await (const line of rli) {
    m = line.match(RE_ROSA)

    if (m) {
      // const player = giocatori[m[3]]
      // player.IDSquadra = TEAMS_MAP[m[1]]

      // const found = await Player
      //   .updateOne({ Codice: player.Codice })
      //   .set({
      //     IDSquadra: player.IDSquadra,
      //     SquadraDiA: player.SquadraDiA,
      //     Ruolo: player.Ruolo
      //   })

      // if (!found) {
      //   await Player.create(player)
      //   sails.log('Created', player.Nome)
      // } else {
      //   sails.log('Updated', player.Nome)
      // }
    }

    m = line.match(RE_BILANCIO)

    if (m) {
      const player = giocatori[m[1]]

      const found = await Player
        .updateOne({ Codice: player.Codice })
        .set({
          payed: parseInt(m[2])
        })
      if (!found) { sails.log.warn('player not found', player) }
    }
  }

  // rl.on('line', async line => {

  // })

  // rl.on('close', line => {
  if (namesCount === detailsCount) {
    writeJson(giocatori, path.resolve(__dirname, './giocatori.json'))
  } else {
    console.error('not the same number of names and details', namesCount, detailsCount)
  }

  if (namesCount !== idsCount) {
    console.error('not the same number of names and ids', namesCount, idsCount)
  }
  // })
}
