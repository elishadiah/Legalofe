// downloadScores.js <int: numero giornata>
const axios = require('axios')
const fs = require('fs')
const serieA2017 = require('./serieA2017.js');

const matchDay = process.argv[2]

let allGet = []
for (let teamName in serieA2017) {
  const teamId = serieA2017[teamName]
  allGet.push(axios.get(`https://www.fantacalcio.it/api/live/${teamId}`, {
    params: { g: matchDay, i: 13 }
  }))
}

let score = {}
axios.all(allGet).then(results => {
  results.forEach(response => {
    const teamId = response.request.path.split('?')[0].split('/').pop()
    score[teamId] = response.data
  })

  const json = JSON.stringify(score)
  fs.writeFile(`./data/score-${matchDay}.json`, json, 'utf8')
})

