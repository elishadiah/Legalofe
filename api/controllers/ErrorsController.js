module.exports = {
  report: async function (req, res) {
    const message = req.param('message')
    const lineno = req.param('lineno')
    const colno = req.param('colno')

    sails.log.error(message)
    sails.log.error(`${req.param('source')} @ <${lineno}:${colno}>`)
    sails.log.error(req.param('error'))

    return res.ok()
  }
}
