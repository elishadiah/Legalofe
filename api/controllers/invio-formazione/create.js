module.exports = {

  friendlyName: 'Index',

  description: 'Index invio formazione.',

  inputs: { },

  exits: { },

  fn: async function () {
    const team = await Team.findOne(this.req.param('team'))

    const match = await FantaIncontro
      .findOne({
        where: {
          IDFantagiornata: this.req.param('day'),
          or: [
            { teamHome: team.id },
            { teamAway: team.id }
          ]
        }
      })
      .populate('IDFantagiornata')

    if (!match) {
      sails.log.error('Match non trovato')
      return this.res.badRequest('Incontro non trovato, non è possibile inserire una formazione')
    }

    let recipients = this.req.param('destinatari') || []
    let addresses = new Set()

    if (recipients.includes('Avversario')) {
      const foeId = match.teamHome === team.id ? match.teamAway : match.teamHome
      const foe = await Team.findOne(foeId).populate('manager')

      if (foe) {
        addresses.add(foe.manager.emailAddress)
      }
    }

    if (recipients.includes('Presidente')) {
      addresses.add('amiluka@libero.it')
    }

    if (recipients.includes('Webmaster')) {
      addresses.add('luca.digioia@gmail.com')
    }

    if (recipients.includes('SeStessi')) {
      addresses.add(this.req.me.emailAddress)
    }

    if (recipients.includes('Tutti')) {
      for (const team of this.req.league.teams) {
        const manager = await User.findOne(team.id)
        addresses.add(manager.emailAddress)
      }
    }

    let newFormazione
    try {
      let toWrite = this.req.body

      // workaround to fix issue of playersPositions not an object
      if (typeof toWrite.playersPositions === 'string' ||
          toWrite.playersPositions instanceof String) {
        sails.log.warn('Positions is a string, try to parse it')
        sails.log.info('Inv Form - Who:', this.req.me.emailAddress, this.req.get('User-Agent'))
        sails.log.info('Invio-Formazione - positions', toWrite.playersPositions)
        sails.log.info('Invio-Formazione - players', toWrite.players)
        try {
          toWrite.playersPositions = JSON.parse(toWrite.playersPositions)
          toWrite.players = toWrite.playersPositions.map(x => x.id)
        } catch (e) {
          sails.log.error(e)
          sails.log.error('playersPositions is a string but not JSON')
          return this.res.sendStatus(400)
        }
      }

      newFormazione = await Formazione
        .updateOne({
          day: this.req.body.day,
          team: this.req.body.team
        })
        .set({ ...toWrite })

      if (!newFormazione) {
        newFormazione = await Formazione.create(toWrite).fetch()
      }
    } catch (e) {
      sails.log.error('cant create formazione', e)
      return this.res.sendStatus(400)
    }

    // If all teams submitted the standing, then lock FG
    const submitCount = await Formazione
      .count({ day: this.req.body.day })

    if (submitCount === this.req.league.teams.length) {
      await FantaGiornata
        .updateOne(this.req.body.day)
        .set({ locked: true })
    }

    // Fetch newly created standing for emailing purpose
    newFormazione = await Formazione
      .findOne(newFormazione.id)
      .populate('players')

    for (const p of newFormazione.players) {
      p.pos = newFormazione.playersPositions.find(x => p.id === x.id).pos
    }

    newFormazione.players = _.sortBy(newFormazione.players, 'pos')

    for (let to of addresses) {
      try {
        await sails.helpers.sendTemplateEmail.with({
          to,
          subject: `${team.name} ha schierato la sua formazione`,
          template: 'email-formazione-creata',
          templateData: {
            team,
            match,
            players: newFormazione.players,
            message: this.req.param('comunicazioni') || ''
          }
        })
      } catch (e) {
        sails.log.error(e)
      }
    }

    return this.res.sendStatus(204)
  }
};
