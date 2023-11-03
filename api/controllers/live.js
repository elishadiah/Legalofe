module.exports = {


  friendlyName: 'Live',


  description: 'Live something.',


  inputs: {
      
  },


  exits: {
    success: {
      viewTemplatePath: 'pages/live',
    }
  },


  fn: async function (inputs) {

    const lega = this.req.league
    const y = lega.season
    const ed = ""+y+"-"+(y+1-2000)
    const nextFantagiornata = lega.nextFantagiornata
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
     //const mydict: mtchlist;
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
   

    return { title: 'Live', playerV }
  }
};
