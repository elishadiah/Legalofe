module.exports = {


  friendlyName: 'View homepage',


  description: 'Display the homepage',


  exits: {

    success: {
      statusCode: 200,
      viewTemplatePath: 'pages/home'
    }
  },


  fn: async function () {
    const MESI = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']
    
    const lega = this.req.league
    const teams = lega.teams
    const y = lega.season
    const ed = ""+y+"-"+(y+1-2000)
 

    // const nextFantagiornata = (await FantaGiornata.find({
    //   where: { date: { '>=': new Date().toISOString().slice(0, 10) } },
    //   sort: [ { date: 'ASC' } ],
    //   limit: 1
    // }))[0]
     const nextFantagiornata = lega.nextFantagiornata;
     let playerV = {};
    let  mainpg = `https://www.fantacalcio.it/serie-a/calendario/${nextFantagiornata.daySerieA}/${ed}`;
    const res = await sails.config.globals.axios.get(mainpg);
    const H = sails.config.globals.cheerio.load(res.data)
    let mlist = H("#matchControl option");
    let mtchlist = [];
    mlist.each((idx, el) => {
          var md = H(el).attr('value');
          var mds= md.split('/');
          mtchlist.push( [ mds[0], mds[1], mds[2]  ] ) ;
            });
    for(let i=0; i<mtchlist.length; i++){
      await new Promise(r => setTimeout(r, Math.floor(Math.random() * 45) + 5));
      let murl = `https://www.fantacalcio.it/serie-a/calendario/${nextFantagiornata.daySerieA}/${ed}/${mtchlist[i][0]}-${mtchlist[i][1]}/${mtchlist[i][2]}/voti`;
      const res = await sails.config.globals.axios.get(murl);
      let HM = sails.config.globals.cheerio.load(res.data);      
      
      
           teamd = { 0: "div.col.home ul.player-list li.player-item",
                1: "div.col.away ul.player-list li.player-item"};
                
      for (const tid in teamd){
        let idx = Number(tid);
        let plist = HM( teamd[tid] );
        playerV[mtchlist[i][idx]]=[];

        plist.each((ii,ee)=> {
          let pl = HM(ee).attr('data-id');
          let stri="";
          let evstri = HM(ee).children(".player-events-strip").children(".player-event");
          evstri.each((idx, el) => {
              stri+= HM(el).attr("data-event-id") !== undefined ? HM(el).attr("data-event-id") : HM(el).attr("data-id");
              //stri+= HM(el).attr("data-event-id").length > 0 ? HM(el).attr("data-event-id") : HM(el).attr("data-id");
              //stri+=HM(el).attr("data-event-id");
              //stri+=HM(el).attr("data-id");
              stri+=",";
          });
          if (stri.length > 0) stri = stri.substring(0, stri.length -1);

          let v;
          if (HM(ee).children('.player-grade').attr('data-value') !== undefined )
            v = HM(ee).children('.player-grade').attr('data-value').trim().replace(",",".");
          else
            v = HM(ee).children('.player-grade').text().trim().replace(",",".");

          if ( v.length > 1 && v[0]==='-')
            v = v.substring(1);

          let vn;
          if(!v.includes("-"))
           vn = Number(v)
          else
            vn=""
          playerV[mtchlist[i][idx]].push({id: pl, 
                                        nome: HM(ee).children(".player-name").text().trim().toUpperCase(),
                                        voto: vn,
                                        evento: stri   });
            });

      }
        
      }//for



    const nextMatches = nextFantagiornata ? await FantaIncontro
      .find({
        where: {
          IDFantagiornata: nextFantagiornata.id
        }
      })
      .populate('teamHome')
      .populate('teamAway')
      .populate('IDFantagiornata') : []

    const nextMatchesByTeam = {}
    if (nextMatches) {
      for (let m of nextMatches) {
        nextMatchesByTeam[m.teamHome.id] = m.id
        nextMatchesByTeam[m.teamAway.id] = m.id
      }
    }

    const classifica = lega.fantagiornata ? await Classifica
      .find({
        where: {
          season: lega.season,
          girone: lega.fantagiornata.girone
        },
        sort: [{ points: 'DESC' }]
      })
      .populate('team') : []

    const risultati = lega.fantagiornata ? await FantaIncontro
      .find({
        where: {
          season: lega.season,
          IDFantagiornata: lega.fantagiornata.id
        }
      })
      .populate('teamHome')
      .populate('teamAway')
      .populate('IDFantagiornata') : []

    // Top / Flop teams
    let topFlopTeams = []
    risultati.forEach(match => {
      topFlopTeams.push({ team: match.teamHome, bonus: match.totalHome })
      topFlopTeams.push({ team: match.teamAway, bonus: match.totalAway })
    })
    topFlopTeams = _.sortBy(topFlopTeams, 'bonus')

    // Top 11 players
    let top11 = lega.fantagiornata ? await TopFlop
      .find({
        where: { day: lega.fantagiornata.id, type: 'top' }
      })
      .populate('player') : []
    top11 = _.sortBy(top11, 'player.Ruolo')
    top11.forEach(x => { x.player.team = teams.find(t => t.id === x.player.IDSquadra) })

    const topPlayer = _.sortBy(top11, 'fantaVoto').reverse()[0]

    // Flop 11 players
    let flop11 = lega.fantagiornata ? await TopFlop
      .find({
        where: { day: lega.fantagiornata.id, type: 'flop' }
      })
      .populate('player') : []
    flop11 = _.sortBy(flop11, 'player.Ruolo')
    flop11.forEach(x => { x.player.team = teams.find(t => t.id === x.player.IDSquadra) })

    // Big Match
    let bigMatch = null
    let bigMatchWeights = []

    if (nextMatches && classifica.length) {
      for (let match of nextMatches) {
        let positionHome = classifica.findIndex(x => x.team.id === match.teamHome.id)
        let positionAway = classifica.findIndex(x => x.team.id === match.teamAway.id)

        if (positionHome >= 0 && positionAway >= 0) {
          bigMatchWeights.push({
            position: positionHome + 1 + positionAway + 1,
            teamHome: match.teamHome,
            teamAway: match.teamAway,
            pointsHome: classifica[positionHome].points,
            pointsAway: classifica[positionAway].points,
            pointsDiff: Math.abs(classifica[positionHome].points - classifica[positionAway].points)
          })
        }
      }

      bigMatchWeights = _.sortBy(bigMatchWeights, 'position')

      if (bigMatchWeights.length >= 2) {
        if (bigMatchWeights[1].position > 1.2 * bigMatchWeights[0].position) {
          bigMatch = bigMatchWeights[0]
        } else {
          if (bigMatchWeights[0].pointsDiff <= bigMatchWeights[1].pointsDiff) {
            bigMatch = bigMatchWeights[0]
          } else {
            bigMatch = bigMatchWeights[1]
          }
        }
      }
    }

    const date = lega.fantagiornata ? new Date(lega.fantagiornata.date) : null
    const nextDate = nextFantagiornata ? new Date(nextFantagiornata.date) : null

    const standings = nextFantagiornata ? await Formazione
      .find({
        where: { day: nextFantagiornata.id }
      })
      .populate('players') : await Formazione
      .find({
        where: { day: 18 }
      })
      .populate('players') 
    const sentStandings = {}

    for (let standing of standings) {
      sentStandings[standing.team] = !!standing.players
    }

    // locals
    return {
      day: lega.day,
      date: date ? `Dom ${date.getDate()} ${MESI[date.getMonth()]} ${date.getFullYear()}` : '',
      nextFantagiornata,
      nextDay: nextFantagiornata ? nextFantagiornata.day : null,
      nextDate: nextDate ? `Dom ${nextDate.getDate()} ${MESI[nextDate.getMonth()]} ${nextDate.getFullYear()}` : null,
      standingsDeadline: nextFantagiornata ? nextFantagiornata.deadline || nextDate : null,

      teams,
      classifica,
      risultati,
      nextMatches,
      nextMatchesByTeam,
      standings,
      sentStandings,
      bigMatch,
      bigMatchWeights,
      playerV,
      topFlopTeams,
      topPlayer,
      top11,
      flop11
    }

  }


};
