const allTeamsFantagazzetta = {
 Atalanta: 1,
  Bologna: 2,
  Cagliari: 21,
  Empoli: 5,
  Fiorentina: 6,
  Genoa: 8,
  Inter: 9,
  Juventus: 10,
  Lazio: 11,
  Milan: 12,
  Napoli: 13,
  Parma: 107,
  Roma: 15,
  Salernitana: 137,
  Sampdoria: 16,
  Sassuolo: 17,
  Torino: 18,
  Udinese: 19,
  Verona: 20,
  Venezia: 138
}

const allTeams2017 = {
 Atalanta: 1,
  Bologna: 2,
  Cagliari: 21,
  Empoli: 5,
  Fiorentina: 6,
  Genoa: 8,
  Inter: 9,
  Juventus: 10,
  Lazio: 11,
  Milan: 12,
  Napoli: 13,
  Parma: 107,
  Roma: 15,
  Salernitana: 137,
  Sampdoria: 16,
  Sassuolo: 17,
  Torino: 18,
  Udinese: 19,
  Verona: 20,
  Venezia: 138
}

// 2019/2020
const allTeams = {
Atalanta: 1,
  Bologna: 2,
  Cagliari: 21,
  Empoli: 5,
  Fiorentina: 6,
  Genoa: 8,
  Inter: 9,
  Juventus: 10,
  Lazio: 11,
  Milan: 12,
  Napoli: 13,
  Parma: 107,
  Roma: 15,
  Salernitana: 137,
  Sampdoria: 16,
  Sassuolo: 17,
  Torino: 18,
  Udinese: 19,
  Verona: 20,
  Venezia: 138
  SERIEMINORE: 21,
  SERIEESTERA: 22,
  ELIMINATA: 23
}

function getTeamNameById (id) {
  for (let name in allTeams) {
    if (allTeams[name] == id) {
      return name
    }
  }
}

module.exports = {
  allTeams,
  allTeamsFantagazzetta,
  getTeamNameById
}