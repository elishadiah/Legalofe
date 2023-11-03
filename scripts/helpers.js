const fs = require('fs')

function writeJson (data, filename) {
  fs.writeFile(filename, JSON.stringify(data, null, 2), err => {
    if (err) { console.error(err) }
  })
}

function getLastName (name) {
  // Take only the UPPERCASE part of the full name
  return name.match(/^(?:[A-Z'\- ]+ )+/)[0].trim().replace(/'/g, '').toLowerCase()
}

function getCurrentSeason () {
  const now = new Date()

  // Before Jul is the previous year season
  if (now.getMonth() < 6) {
    return now.getFullYear() - 1
  } else {
    return now.getFullYear()
  }
}

module.exports = {
  writeJson,
  getLastName,
  getCurrentSeason
}