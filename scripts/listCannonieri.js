async function x () {
    const incontri = await FantaIncontro.find({
    where: {
      season: 2019,
      Giocato: true
    },
    limit: 100
  })

  const RE = /([a-zA-Z .]+)(?:\((\d)\))?\s*(?:\(B\))?/

  const canno = {}
  for (let match of incontri) {
    const allPlayers = [ ...match.scorersHome.split(','), ...match.scorersAway.split(',') ]
    for (let player of allPlayers) {
      const m = player.match(RE)
      if (m) {
        canno[m[1].trim()] = (canno[m[1].trim()] || 0) + (parseInt(m[2]) || 1)
      }
    }
  }

  const list = []
  for (let p in canno) {
    list.push({ p, goals: canno[p] })
  }

  console.log(_.sortBy(list, 'goals'))
}
