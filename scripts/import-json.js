const fs = require('fs')
const path = require('path')
const ProgressBar = require('progress')
const readline = require('readline')
const stream = require('stream')

module.exports = {

  friendlyName: 'Import json',

  description: '',

  inputs: {
    json: {
      description: 'JSON file to import',
      type: 'string'
    },
    input: {
      description: 'Generic file to import',
      type: 'string'
    },
    what: {
      type: 'string',
      required: true
    }
  },

  fn: async function (inputs) {
    sails.log(`Importing ${inputs.what} from ${inputs.json}`);

    let data
    if (inputs.json) {
      const json = fs.readFileSync(inputs.json);
      data = JSON.parse(json);
    }

    let bar
    if (data) {
      bar = new ProgressBar('  [:bar] :current/:total :etas', {
        total: data.length || Object.keys(data).length,
        incomplete: ' ',
        width: 30
      });
    }

    switch (inputs.what) {
      case 'classifica':
        for (const entry of data) {
          await Classifica.create({
            points: entry.Punti,
            team: entry.ID,
            girone: entry.IDGirone,
            competizione: entry.IDCompetizione,
            season: 2018,
            day: entry.IDGirone >=2 ? 37 : 19,

            wonHome: entry.PartiteVinte.Casa,
            wonAway: entry.PartiteVinte.Fuori,
            drawnHome: entry.PartiteNulle.Casa,
            drawnAway: entry.PartiteNulle.Fuori,
            lostHome: entry.PartitePerse.Casa,
            lostAway: entry.PartitePerse.Fuori,

            goalsHome: entry.RetiFatte.Casa,
            goalsAway: entry.RetiFatte.Fuori,
            goalsAgainstHome: entry.RetiSubite.Casa,
            goalsAgainstAway: entry.RetiSubite.Fuori,

            MI: entry.MI,
            totalAvg: entry.TMed,
            totalMin: entry.TMin,
            totalMax: entry.TMax,
            totalDev: entry.TDevSt,
            totalTot: entry.TTot
          });
          bar.tick()
        }
        break;

      case 'giocatori':
        for (let id in data) {
          const entry = data[id];

          await Player.create({
            id,
            SquadraDiA: entry.SquadraDiA,
            Ruolo: parseInt(entry.Ruolo),
            Codice: parseInt(entry.Codice),
            Crediti: parseInt(entry.Crediti),
            Extracom: parseInt(entry.Extracom),
            Nome: entry.Nome,
            IDGazzetta: entry.IDGazzetta ? parseInt(entry.IDGazzetta) : null
          });
          bar.tick()
        }
        break;

      case 'squadre-giocatori':
        for (let player of data) {
          await Player.update(player.ID).set({ IDSquadra: player.IDSquadra })
          bar.tick()
        }
        break;

      case 'squadre':
        for (let entry of data) {
          let user = await User.findOrCreate(
            { fullName: entry.Presidente },
            {
              emailAddress: entry.Email,
              password: await sails.helpers.passwords.hashPassword('password'),
              fullName: entry.Presidente
            })

          await Team.create({
            id: entry.ID,
            name: entry.Nome,
            manager: user.id
          })
          bar.tick()
        }
        break;

      case 'formazioni':
        for (let id in data) {
          const m = inputs.json.match(/^.+-(\d+)-(\d+)\.json/)

          let players = data[id]
          // ID to int, change Pos -1 with 100 for easy sorting
          players.map(x => {
            if (x.Pos === -1) { x.Pos = 100 }
            x.pos = x.Pos
            delete x.Pos
            x.id = parseInt(x.id)
            return x
          })

          if (!m) { throw 'Bad filename'; }

          await Formazione.create({
            team: parseInt(id),
            season: m[1],
            day: m[2],
            players: players.map(x => parseInt(x.id)),
            playersPositions: players
          });
          bar.tick()
        }
        break;

      case 'incontri':
        for (let incontro of data) {
          await FantaIncontro.create({
            season: 2018,
            IDGirone: incontro.IDGirone,
            GiornataDiA: incontro.GiornataDiA,
            Giocato: incontro.Giocato === 1,
            teamHome: incontro.IDSquadre.Casa,
            teamAway: incontro.IDSquadre.Fuori,
            goalsHome: incontro.Gol.Casa,
            goalsAway: incontro.Gol.Fuori,
            totalHome: incontro.Totali.Casa,
            totalAway: incontro.Totali.Fuori
          });
          bar.tick()
        }
        break;

      case 'album':
        const RE_ALBUM = /Album\((.+)\)/

        let playerCache
        let allTeams = await Team.find()
        let teamsNotFound = new Set()

        let input = fs.createReadStream(inputs.input)
        const rl = readline.createInterface({ input })

        for await (const line of rl) {
          const m = line.match(RE_ALBUM)
          if (m) {
            const album = m[1].split(',').map(eval)

            if (!playerCache || playerCache.Codice !== album[0]) {
              playerCache = await Player.findOne({ Codice: album[0] })
            }

            let player = playerCache
            let team = allTeams.find(t => t.name === album[8])
            if (!team) {
              teamsNotFound.add(album[8])
            }

            let toWrite = {
              player: player.id,
              team: team ? team.id : null,
              teamA: album[10],
              season: album[3].split('/')[0],
              firstDay: album[5],
              presences: album[13],
              totalScores: album[14],
              totalFantaVoti: album[15],
              goals: album[16],
              expulsions: album[17],
              admonitions: album[18],
              cost: album[21],
              yearsOfContract: album[22]
            }

            console.log('writing', album[1], album[3])
            await Album.create(toWrite)
          }
        }

        console.log('the following team were not found', teamsNotFound)

        break;

      default:
        sails.log.error('Undefined');
        break;
    }
  }
};
