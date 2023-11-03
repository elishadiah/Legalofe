parasails.registerPage('invio-formazione', {
  data: {
  },
  computed: {

  },
  methods: {

  },
  mounted () {
    $.get(`/player?IDSquadra=${window.SAILS_LOCALS.teamId}&sort=["Ruolo ASC","Nome ASC"]`, players => {
      arrInvioFormazione = players;

      // for (let i of [0,3,4,5,6,7,11,12,13,14,19]) { ClickGiocatoreRosa(i) }
    })
  }
})

let arrInvioFormazione = []
const totaleNumeroMassimoRiserve=8;
const numeroMassimoRiserve=new Array(0,1,-1,-1,-1);
const panchinaOrdinata=0;
const regolaRigoristi=0;
const moduliAmmessi = [
  [0,1,3,4,3],
  [0,1,3,5,2],
  [0,1,3,6,1],
  [0,1,4,3,3],
  [0,1,4,4,2],
  [0,1,4,5,1],
  [0,1,5,2,3],
  [0,1,5,3,2],
  [0,1,5,4,1]
]

var arrRosa = new Array();
var arrFormazione = new Array();
var coloreRuoli = Array ( '', 'G', 'V', 'R', 'Blu' );
var coloreDati = Array ( 'Rv', 'CellaRvRosso', 'CellaRvCiano', 'CellaRvVerde' );
var ruoli = Array ( '', 'P', 'D', 'C', 'A' );

var moduloInserito = new Array( 0, 0, 0, 0, 0 );
var titolariInseriti = 0;
var riserveInserite = new Array( 0, 0, 0, 0, 0 );
var totaleRiserveInserite = 0;

var rigoristi = false;
var arrRigoristi = new Array();

var incontriValidi = new Array();

var idxFsq;

for (let i = 1; i <= 11 + totaleNumeroMassimoRiserve; arrFormazione[i] = arrRigoristi[i++] = -1){;}

function ClickGiocatoreRosa(idG)
{
  var gg = arrInvioFormazione[idG];
  if (!gg.Formazione) {
    var result;
    if (titolariInseriti < 11) {result = InserisciTitolare(gg, idG);}
    else {result = InserisciRiserva(gg, idG);}
    if (result) {CambiaAttributiGiocatoreRosa(idG, true);}
  }
  else {
    if (gg.Formazione <= 11) {RimuoviTitolare(gg, idG);}
    else {RimuoviRiserva(gg, idG);}
    CambiaAttributiGiocatoreRosa(idG, false);
  }
}

function ClickGiocatoreFormazione(pos)
{
  var idG = arrFormazione[pos];
  if (idG === -1) {return;}

  var gg = arrInvioFormazione[idG];
  if (pos <= 11) {RimuoviTitolare(gg, idG);}
  else {RimuoviRiserva(gg, idG);}
  CambiaAttributiGiocatoreRosa(idG, false);
}

function InserisciTitolare(gg, idG)
{
  // Controlla se il nuovo modulo è compatibile
  moduloInserito[gg.Ruolo]++;

  let compatibile = false;
  for (let m = 0; m < moduliAmmessi.length; m++) {
    if (moduloInserito[1] <= moduliAmmessi[m][1] &&
        moduloInserito[2] <= moduliAmmessi[m][2] &&
        moduloInserito[3] <= moduliAmmessi[m][3] &&
        moduloInserito[4] <= moduliAmmessi[m][4]) {
      compatibile = true;
      break;
    }
  }

  if (!compatibile) {
    moduloInserito[gg.Ruolo]--;
    alert('Impossibile inserire il giocatore in formazione: il modulo che ne deriverebbe non è ammesso nella competizione');
    return false;
  }

  // Cerca posizione d'inserimento
  let p
  for (p = 1; p <= 11; p++) {
    if (arrFormazione[p] === -1 || arrInvioFormazione[arrFormazione[p]].Ruolo > gg.Ruolo) {
      break;
    }
  }

  // Sposta giocatori già inseriti
  for (let i = titolariInseriti; i >= p; i--) {
    arrFormazione[i + 1] = arrFormazione[i];
    arrInvioFormazione[arrFormazione[i]].Formazione = i + 1;
  }

  // Inserisci nuovo giocatore
  arrFormazione[p] = idG;
  gg.Formazione = p;
  titolariInseriti++;

  // Visualizza nuova formazione
  VisualizzaTabellaFormazione();
  return true;
}


function RimuoviTitolare(gg, idG)
{
  // Sposta giocatori gi� inseriti
  var i;
  for (i = gg.Formazione; i <= 11; i++) {
    if (i < titolariInseriti) {
      arrFormazione[i] = arrFormazione[i + 1];
      arrInvioFormazione[arrFormazione[i]].Formazione = i;
    }
    else {arrFormazione[i] = -1;}
  }

  // Rimuovi giocatore
  gg.Formazione = 0;
  titolariInseriti--;
  moduloInserito[gg.Ruolo]--;

  // Visualizza nuova formazione
  VisualizzaTabellaFormazione();
  return true;
}

function InserisciRiserva(gg, idG)
{
  // Controlla se � possibile inserire altre riserve
  if (totaleRiserveInserite >= totaleNumeroMassimoRiserve) {
    alert('Hai già inserito il numero massimo di riserve');
    return false;
  }
  if (numeroMassimoRiserve[gg.Ruolo] !== -1 &&
  riserveInserite[gg.Ruolo] >= numeroMassimoRiserve[gg.Ruolo]) {
    alert('Hai già inserito il numero massimo di riserve in questo ruolo');
    return false;
  }

  // Cerca posizione d'inserimento
  var p;
  for (p = 12; p <= 11 + totaleNumeroMassimoRiserve; p++) {
    if (arrFormazione[p] === -1 || (panchinaOrdinata && arrInvioFormazione[arrFormazione[p]].Ruolo > gg.Ruolo)) {
      break;
    }
  }

  // Sposta giocatori gi� inseriti
  var i;
  for (i = 11 + totaleRiserveInserite; i >= p; i--) {
    arrFormazione[i + 1] = arrFormazione[i];
    arrInvioFormazione[arrFormazione[i]].Formazione = i + 1;
  }

  // Inserisci nuovo giocatore
  arrFormazione[p] = idG;
  gg.Formazione = p;
  totaleRiserveInserite++;
  riserveInserite[gg.Ruolo]++;

  // Visualizza nuova formazione
  VisualizzaTabellaFormazione();
  return true;
}

function RimuoviRiserva(gg, idG)
{
  // Sposta giocatori gi� inseriti
  var i;
  for (i = gg.Formazione; i <= 11 + totaleNumeroMassimoRiserve; i++) {
    if (i < 11 + totaleRiserveInserite) {
      arrFormazione[i] = arrFormazione[i + 1];
      arrInvioFormazione[arrFormazione[i]].Formazione = i;
    }
    else {arrFormazione[i] = -1;}
  }

  // Rimuovi giocatore
  gg.Formazione = 0;
  totaleRiserveInserite--;
  riserveInserite[gg.Ruolo]--;

  // Visualizza nuova formazione
  VisualizzaTabellaFormazione();
  return true;
}

function CambiaAttributiGiocatoreRosa(idG, sel)
{
  if (sel) {
    // document.getElementById('r_ruolo' + idG).className = 't-xxsI';
    document.getElementById('r_nome' + idG).className = 't-xxsI';
  }
  else {
    // document.getElementById('r_ruolo' + idG).className = 't-xxs' + coloreRuoli[arrInvioFormazione[idG].Ruolo] + 'B';
    document.getElementById('r_nome' + idG).className = '';
  }
}

function VisualizzaTabellaFormazione()
{
  document.getElementById('f_titolari').innerHTML = 'Titolari (' + moduloInserito[1] + '-' + moduloInserito[2] + '-' + moduloInserito[3] + '-' + moduloInserito[4] + ')';
  document.getElementById('f_riserve').innerHTML = 'Riserve (' + riserveInserite[1] + '-' + riserveInserite[2] + '-' + riserveInserite[3] + '-' + riserveInserite[4] + ')';

  var i;
  for (i = 1; i <= 11 + totaleNumeroMassimoRiserve; i++) {
    if (arrFormazione[i] === -1) {
      document.getElementById('f_ruolo' + i).innerHTML = '';
      document.getElementById('f_ruolo' + i).className = '';
      document.getElementById('f_nome' + i).innerHTML = '';
    } else {
      var gg = arrInvioFormazione[arrFormazione[i]];
      document.getElementById('f_ruolo' + i).innerHTML = ruoli[gg.Ruolo];
      document.getElementById('f_ruolo' + i).className = `player-role player-role--${gg.Ruolo}`;
      document.getElementById('f_nome' + i).innerHTML = `<strong>${gg.Nome} <span class="has-text-grey has-text-weight-normal">${gg.SquadraDiA}</span></strong>`;
      // document.getElementById('f_nome' + i).className = 't-xxs' + coloreRuoli[gg.Ruolo] + 'B';
    }
  }
}

function InviaFormazione()
{
  if (!ControllaFormazione()) { return; }

  const standing = GeneraFormazioneJson()

  let destinatari = []
  document.querySelectorAll('[name="destinatari"]').forEach(el => {
    if (el.checked) {
      destinatari.push(el.value)
    }
  })

  const data = {
    team: window.SAILS_LOCALS.teamId,
    day: window.SAILS_LOCALS.match.IDFantagiornata.id,
    players: standing.players,
    playersPositions: standing.playersPositions,

    // Email
    comunicazioni: document.querySelector('[name="comunicazioni"]').value,
    destinatari,

    _csrf: window.SAILS_LOCALS._csrf
  }

  $.ajax({
    type: 'POST',
    url: '/formazione',
    data: JSON.stringify(data),
    contentType: 'application/json',
    dataType: 'json'
  })
    .done(() => {
      alert('Formazione inserita con successo')
    })
    .fail(() => {
      alert('Errore! Formazione non inserita')
    })
}

function ControllaFormazione()
{
  const inTrasferta = window.SAILS_LOCALS.teamId == window.SAILS_LOCALS.match.teamAway.id

  // Controlla titolari inseriti
  if (titolariInseriti !== 11) {
    alert('Impossibile inviare la formazione: uno o più titolari non inseriti');
    return false;
  }

  if (riserveInserite[1] <= 0) {
    alert('Impossibile inviare la formazione: portiere di riserva non inserito')
    return false
  }

  if (inTrasferta) {
    const ok = moduloInserito[2] >= 4 && moduloInserito[4] <= 2
    if (!ok) {
      alert('Impossibile inviare la formazione: modulo non ammesso in trasferta')
      return false
    }
  }

  // Controlla riserve inserite
  if (totaleRiserveInserite < totaleNumeroMassimoRiserve) {
    if (!confirm('La formazione è incompleta, vuoi inviarla comunque?')) { return; }
  }

  return true;
}

function GeneraFormazioneJson()
{
  let players = []

  for (var i = 0; i < arrInvioFormazione.length; i++) {
    let player = arrInvioFormazione[i]
    let pos = player.Formazione

    if (!player.Formazione) {
      pos = 100
    }
    players.push({ id: player.id, pos })
  }

  players = _.sortBy(players, ['pos'])

  return { players: players.map(p => p.id), playersPositions: players }
}
