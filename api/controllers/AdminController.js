/**
 * AdminController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const fs = require('fs')
const path = require('path')
const unzipper = require('unzipper')

const calcolaGiornata = require('../../scripts/calcolaGiornata')

module.exports = {
  index: async function(req, res) {
    const classifica = await Classifica
      .find({
        where: {
          season: req.league.season,
          girone: req.league.fantagiornata.girone
        },
        sort: [ { points: 'DESC' } ]
      })
      .populate('team')

    return res.view('pages/admin/index', {
      classifica
    })
  },

  calcolaGiornata: async function(req, res) {
    if (!req.param('day')) {
      return res.badRequest(new Error('Missing param day'))
    }

    try {
      await calcolaGiornata({
        day: req.param('day'),
        scores: req.param('scores'),
        force: req.param('force')
        // dryRun: true
      })

      return res.send({ error: false })
    } catch (e) {
      return res.send({
        error: e.message
      })
    }
  },

  campionato: (req, res) => res.view('pages/admin/campionato'),
  newCampionato: (req, res) => res.view('pages/admin/new-campionato'),
  playersTransfer: (req, res) => res.view('pages/admin/players-transfer'),

  uploadPlayersPhotos: async function (req, res) {
    let foundPhotos = 0

    if (req._fileparser.upstreams.length) {
      const zip = req.file('photos')._files[0].stream
        .pipe(unzipper.Parse({forceStream: true}))

      for await (const entry of zip) {
        const fileName = entry.path

        if (fileName.endsWith('.jpg') || fileName.endsWith('.png')) {
          entry.pipe(fs.createWriteStream('.tmp/uploads/foto/' + path.basename(fileName)))
          foundPhotos++
        } else {
          entry.autodrain()
        }
      }
    }

    return res.send({ foundPhotos })
  }
}
