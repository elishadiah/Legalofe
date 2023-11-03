module.exports = {
  friendlyName: 'Fix formazioni',

  inputs: {
    id: { type: 'number', required: true }
  },

  fn: async function fix (inputs) {
    const f = await Formazione.findOne(inputs.id)

    try {
      const playersPositions = JSON.parse(f.playersPositions)

      await Formazione.updateOne(inputs.id).set({
        playersPositions,
        players: playersPositions.map(x => x.id)
      })

      sails.log('Formazione sistemata!')
    } catch (e) {
      sails.log.error(e)
      sails.log.error('Formazione non in formato JSON')
    }
  }
}
