module.exports = {


  friendlyName: 'Index',


  description: 'Index calendario.',


  inputs: {

  },


  exits: {
    success: {
      viewTemplatePath: 'pages/calendario',
    }
  },


  fn: async function () {
    // const QUERY = `SELECT * FROM fantaincontro fi
    // INNER JOIN fantagiornata fg
    // ON fg.id = fi.IDFantagiornata
    // WHERE fg.season = ${this.req.league.season}`

    // const incontri = await FantaIncontro
    //   .getDatastore()
    //   .sendNativeQuery(QUERY)

    const incontri = await FantaIncontro
      .find({
        where: { season: this.req.league.season }
      })
      .populate('teamHome')
      .populate('teamAway')
      .populate('IDFantagiornata')

    // Group by Fanta Giornata
    let incontriGiornata = _.groupBy(incontri, 'IDFantagiornata.id')

    incontriGiornata = Object.values(incontriGiornata)
    incontriGiornata.sort((a, b) => {
      if (a[0].IDFantagiornata.girone !== b[0].IDFantagiornata.girone) {
        return a[0].IDFantagiornata.girone - b[0].IDFantagiornata.girone
      } else {
        return a[0].IDFantagiornata.day - b[0].IDFantagiornata.day
      }
    })

    return { title: 'Calendario', incontriGiornata }
  }
}
