#!/usr/bin/env node

/**
 * ./createFormazioni.js <year> <day> [<data_path>]
 *
 * Read fcmFormazioniDatiXX.js and finds players entries in the format of:
 *   a[13]=new Z(2253,8,0,xg107,xa10,3,0,0)
 * then create a JSON version of the standing file
 */

const year = process.argv[2]
const day = process.argv[3]
const DATA_PATH = process.argv[4] || '.'

const path = require('path')
const readline = require('readline')
const fs = require('fs')
const { writeJson } = require('./helpers')

const RE_PLAYER = /a\[\d+\]=new Z\((\d+),(\d+),(\d+),xg(\d+),xa(\d+),(\d+),(-?\d+),(\d+)\)/

if (!day) {
  console.error('day argument is mandatory')
  process.exit(1)
}

let formazioni = {}
let count = 0

let rl = readline.createInterface({
  input: fs.createReadStream(path.resolve(DATA_PATH, `../js/fcmFormazioniDati${day}.js`))
})

rl.on('line', line => {
  const m = line.match(RE_PLAYER)
  if (m) {
    if (!formazioni[m[2]]) {
      formazioni[m[2]] = []
    }

    formazioni[m[2]].push({
      id: m[4],
      Pos: parseInt(m[7])
    })

    count++
  }
})

rl.on('close', line => {
  console.log('Found', count)
  writeJson(formazioni, path.resolve(DATA_PATH, `./formazioni-${year}-${day}.json`))
})