'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var EVENT_IMAGES = {
  1: 'amm_s.png',
  2: 'esp_s.png',
  3: 'golfatto_s.png',
  4: 'golsubito_s.png',
  5: 'assist_s.png',
  6: 'assist_s.png',
  7: 'rigoreparato_s.png',
  8: 'rigoresbagliato_s.png',
  9: 'rigoresegnato_s.png',
  10: 'autogol_s.png',
  11: 'golvittoria_s.png',
  12: 'golpareggio_s.png',
  13: '',
  14: 'uscito_s.png',
  15: 'entrato_s.png',
  21: 'assist_s.png',
  22: 'assist_s.png',
  23: 'assist_s.png',
  24: 'assist_s.png'
};

var EVENT_NAMES = {
  1: '-0.5 AMMONIZIONE',
  2: '-1 ESPULSIONE',
  3: 'GOL FATTO',
  4: 'GOL SUBITO',
  5: '+1 ASSIST',
  6: '+1 ASSIST',
  7: '+3 RIGORE PARATO',
  8: '-3 RIGORE SBAGLIATO',
  9: 'RIGORE SEGNATO',
  10: 'AUTOGOL',
  11: 'GOL VITTORIA',
  12: 'GOL PAREGGIO',
  13: '',
  14: 'USCITO',
  15: 'ENTRATO',
  21: '+1 ASSIST',
  22: '+1 ASSIST',
  23: '+1 ASSIST',
  24: '+1 ASSIST'
};

var EVENTS_SCORES = {
  4: 0,
  9: +1,
  3: +1
};

var EVENTS_SCORES_FV = {
  1: -0.5,
  2: -1,
  3: 0,
  4: 0,
  5: 1,
  6: 1,
  7: 3,
  8: -3,
  9: 0,
  21: 1,
  22: 1,
  23: 1,
  24: 1
};

var ROLES_LETTERS = ['&nbsp;', 'P', 'D', 'C', 'A'];

var SQUADRE_FG = {
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
};

var MESI = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
var GIORNI = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

parasails.registerComponent('match-results', {
  props: {
    calculateScore: {
      type: Boolean,
      default: false
    },
    fantagiornataId: {
      type: Number,
      required: false,
      default: null
    },
    live: {
      // Refresh score each N minutes
      type: Boolean,
      default: false
    },
    scoreSource: {
      type: String,
      default: 'fg'
    },
    showStandings: {
      // Set to false in home page to hide standings
      type: Boolean,
      default: true
    }
  },
  data: function data() {
    return {
      allFantaGiornate: [],
      allMatches: [],
      bonusCasa: 0,
      bonusFuori: 0,
      cGio: 0,
      cInco: null,
      currentSeason: 0,
      datiSquadre: [],
      daySerieA: null,
      fantagiornata: null,
      formazioneCasa: [],
      formazioneFuori: [],
      lastUpdate: new Date(),
      nextMatchId: 0,
      placeholderStanding: [],
      players: [],
      reservePlayersUsed: {},
      scoreCasa: 0,
      scoreFuori: 0,
      scores: [],
      standings: [],
      updateInterval: 3 * 60 // in seconds
    };
  },

  computed: {
    currentMatch: function currentMatch() {
      var _this = this;

      return this.scores.find(function (s) {
        return s.id === _this.cInco;
      });
    },

    // dataGiornata () {
    //   var x = dataGiornata.slice(0)
    //   x.shift()
    //   return x
    // },
    hasFattoreCampo: function hasFattoreCampo() {
      return false;
    },
    playersToShow: function playersToShow() {
      return this.calculateScore ? 19 : 100;
    },
    formattedDate: function formattedDate() {
      if (!this.fantagiornata) {
        return '';
      }
      var date = new Date(this.fantagiornata.date);
      return GIORNI[date.getDay()] + ' ' + date.getDate() + ' ' + MESI[date.getMonth()] + ' ' + date.getFullYear();
    }
  },
  methods: {
    setSearchParam: function (_setSearchParam) {
      function setSearchParam() {
        return _setSearchParam.apply(this, arguments);
      }

      setSearchParam.toString = function () {
        return _setSearchParam.toString();
      };

      return setSearchParam;
    }(function () {
      setSearchParam.apply(undefined, arguments);
    }),
    getFantaVoto: function getFantaVoto(player, role) {
      if (this.scoreSource === 'fg') {
        if (player.voto === 'SV') {
          return 'SV';
        }

        var fv = player.voto;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = player.events[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var evento = _step.value;

            fv += EVENTS_SCORES_FV[evento] || 0;
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        return fv;
      } else if (this.scoreSource === 'gds') {
        return player.voto + (player.assists || 0) * 1 - (player.ammonizioni || 0) * 0.5 - (player.espulsioni || 0) * 1 - (player.failedPenalties || 0) * 3 + (role === 1 ? (player.penalties || 0) * 3 : 0);
      }
    },
    createEvents: function createEvents(player, role) {
      var _EVENT_PROPS;

      var events = [];

      var EVENT_PROPS = (_EVENT_PROPS = {
        ammonizioni: 1,
        espulsioni: 2,
        goals: 3,
        autogoals: 10,
        assists: 5
      }, _defineProperty(_EVENT_PROPS, 'assists', 21), _defineProperty(_EVENT_PROPS, 'assists', 24), _defineProperty(_EVENT_PROPS, 'failedPenalties', 8), _defineProperty(_EVENT_PROPS, 'penalties', role === 1 ? 7 : 9), _EVENT_PROPS);

      for (var prop in EVENT_PROPS) {
        for (var x = 0; x < player[prop]; x++) {
          events.push(EVENT_PROPS[prop]);
        }
      }

      return events;
    },
    loadScoreData: function loadScoreData() {
      var _this2 = this;

      this.datiSquadre = [];
      var allDefferred = [];

      if (this.scoreSource === 'fg') {
        var _loop = function _loop(teamId) {
          allDefferred.push($.getJSON('https://www.fantacalcio.it/api/live/' + teamId + '?g=' + _this2.daySerieA + '&i=' + (_this2.currentSeason - 2005)).then(function (result) {
            _this2.datiSquadre[teamId] = result;
            _this2.lastUpdate = new Date();
          }).catch(function () {
            console.warn('Errore: voti fantagazzetta non caricati');
          }));
        };

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = Object.values(SQUADRE_FG)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var teamId = _step2.value;

            _loop(teamId);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        $.when.apply($, allDefferred).then(this.updateMatchScores);
      } else if (this.scoreSource === 'gds') {
        $.getJSON('/scores?season=' + this.currentSeason + '&day=' + this.daySerieA + '&source=gds').then(function (result) {
          _this2.datiSquadre = result;
          _this2.updateMatchScores();
        });
      }

      // Use only during development
      // $.getJSON('/data/score-' + this.cGio + '.json', function (result) {
      //   _this.datiSquadre = result
      //   _this.updateMatchScores()
      //   _this.lastUpdate = new Date()
      // });
    },
    loadStandings: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(match) {
        var _this3 = this;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return $.getJSON('/formazione?day=' + match).done(function (result) {
                  _this3.standings = result;
                });

              case 2:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function loadStandings(_x) {
        return _ref.apply(this, arguments);
      }

      return loadStandings;
    }(),
    sortStanding: function sortStanding(standing) {
      var _loop2 = function _loop2(player) {
        player.pos = standing.playersPositions.find(function (x) {
          return x.id === player.id;
        }).pos;
      };

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = standing.players[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var player = _step3.value;

          _loop2(player);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      return _.sortBy(standing.players, 'pos');
    },
    updateMatchScores: function updateMatchScores() {
      var _this4 = this;

      this.scores = [];
      this.reservePlayersUsed = {};

      var _loop3 = function _loop3(i) {
        var match = _this4.allMatches[i];
        var standing = null;
        var home = {};
        var away = {};

        standing = _this4.standings.find(function (s) {
          return s.team.id === match.teamHome.id;
        });
        if (standing) {
          standing = _this4.sortStanding(standing);
          home = _this4.getScore(standing);
        }

        standing = _this4.standings.find(function (s) {
          return s.team.id === match.teamAway.id;
        });
        if (standing) {
          standing = _this4.sortStanding(standing);
          away = _this4.getScore(standing);
        }

        if (home.score >= 0 && away.score >= 0) {
          home.score += away.autogol;
          away.score += home.autogol;

          home.scorers = home.scorers.concat(away.autoScorers);
          away.scorers = away.scorers.concat(home.autoScorers);
        }

        home.team = match.teamHome;
        away.team = match.teamAway;

        console.log(match.teamHome.name + ' - ' + home.score + ' - ' + home.bonus + ' (AG ' + home.autogol + ')');
        console.log(match.teamAway.name + ' - ' + away.score + ' - ' + away.bonus + ' (AG ' + away.autogol + ')');

        _this4.scores.push({ id: match.id, home: home, away: away });
      };

      for (var i in this.allMatches) {
        _loop3(i);
      }

      this.onChangeMatch();
    },
    setCurrentMatch: function setCurrentMatch(matchId) {
      var query = '?Gio=' + this.cGio + '&Inco=' + matchId;

      if (this.showStandings) {
        this.cInco = matchId;
        this.onChangeMatch();

        window.history.pushState({}, '', query);
      } else {
        window.location = '/live' + query;
      }
    },
    onChangeMatch: function onChangeMatch() {
      var _this5 = this;

      // Scores not loaded yet
      var score = this.scores.find(function (s) {
        return s.id === _this5.cInco;
      });
      if (!score) {
        return;
      }

      var home = score.home;
      var away = score.away;

      this.scoreCasa = home.score;
      this.bonusCasa = home.bonus;
      this.formazioneCasa = home.standing || this.placeholderStanding;

      this.scoreFuori = away.score;
      this.bonusFuori = away.bonus;
      this.formazioneFuori = away.standing || this.placeholderStanding;
    },
    onChangeMatchDay: function onChangeMatchDay() {
      location.search = 'Gio=' + this.cGio + '&Inco=' + this.cInco;
    },
    findPlayerScore: function findPlayerScore(player) {
      if (!this.datiSquadre.length) {
        return null;
      }

      var teamScore = null;

      if (this.scoreSource === 'fg') {
        var serieAteamId = SQUADRE_FG[player.SquadraDiA];
        teamScore = this.datiSquadre[serieAteamId];

        // This team didn't play yet
        if (!teamScore || teamScore.length === 0) {
          return null;
        }

        for (var i in teamScore) {
          var p = teamScore[i];

          if (p.voto && ( // check if player has a vote
          this.getLastName(player) === p.nome || this.getLastName(player) === p.nome.split(' ')[0] ||
          // fix for players like DI FRANCESCO F
          this.getLastName(player) === p.nome.replace(/\s+\w$/, ''))) {
            return p;
          }
        }
        // The player's team played, he didn't
        return undefined;
      } else if (this.scoreSource === 'gds') {
        teamScore = this.datiSquadre.find(function (x) {
          return x.teamA === player.SquadraDiA.toLowerCase();
        });
        if (teamScore) {
          teamScore = teamScore.scores;
        } else if (player.SquadraDiA && player.SquadraDiA != 'SERIEMINORE') {
          // 6 politico
          return {
            ammonizioni: 0,
            assists: 0,
            autogoals: 0,
            espulsioni: 0,
            failedPenalties: 0,
            // fantaVoto: 6,
            goals: 0,
            penalties: 0,
            voto: 6
          };
        } else {
          console.warn('Il giocatore ' + player.Nome + ' appartiene ad una squadra sconosciuta: ' + player.SquadraDiA);
        }

        if (!teamScore) {
          return null;
        } else {
          var s = teamScore.find(function (x) {
            return x.voto && parseInt(x.id) === player.IDGazzetta;
          });
          if (s) {
            return s;
          }
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = this.datiSquadre[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var team = _step4.value;

              s = team.scores.find(function (x) {
                return x.voto && parseInt(x.id) === player.IDGazzetta;
              });
              if (s) {
                // console.log('=> Giocatore trovato in altra squadra', player.Nome)
                return s;
              }
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }

          return s;
        }
      }
    },
    findSubstitutePlayer: function findSubstitutePlayer(player, standing) {
      for (var x = 11; x < standing.length; x++) {
        var substitute = standing[x];

        if (player.Ruolo === substitute.Ruolo && (
        // se il 1o e 2o portiere non giocano, usa il 3o
        substitute.pos < 100 || player.Ruolo === 1) && !this.reservePlayersUsed[substitute.Nome]) {

          var score = this.findPlayerScore(substitute);
          if (score) {
            this.reservePlayersUsed[substitute.Nome] = true;
            standing[x] = player;
            console.debug('found sub', substitute.Nome);
            return [substitute, score];
          }
        }
      }
    },
    getScore: function getScore(formazione) {
      var score = 0;
      var bonus = 0;
      var autogol = 0;
      var standing = [];
      var scorers = [];
      var autoScorers = [];

      for (var i in formazione) {
        var p = formazione[i];

        if (!this.calculateScore) {
          p.lastName = this.getLastName(p);
          standing.push(p);
          continue;
        }

        var player = this.findPlayerScore(p);

        if (player === null && i < 11) {
          // the player's team didn't play
          var x = this.findSubstitutePlayer(p, formazione);
          if (x) {
            player = x[1];
            player.substituted = p.Nome;
            // Old player
            p = x[0];
          } else {
            p.fantaVoto = 'SV';
          }
        } else if ((player === undefined || player && player.voto === 0) && i < 11) {
          // the player didn't play yet his team did
          // or the player played but the score is 0 (played few minutes)
          var _x2 = this.findSubstitutePlayer(p, formazione);
          if (_x2) {
            // New player that replace old one
            player = _x2[1];
            player.substituted = p.Nome;
            // Old player
            p = _x2[0];
          } else {
            player = null;
          }
        }

        if (player) {
          p.substituted = player.substituted;

          if (this.scoreSource === 'fg') {
            p.events = player.evento ? player.evento.split(',') : [];
            player.events = p.events;
          } else if (this.scoreSource === 'gds') {
            p.events = this.createEvents(player, p.Ruolo);
            player.events = p.events;
          }

          p.voto = player.voto;
          p.fantaVoto = this.getFantaVoto(player, p.Ruolo);
          p.modif = p.modif || p.fantaVoto - p.voto;
          if (!p.voto) {
            p.voto = null;
          }
          if (!p.fantaVoto) {
            p.fantaVoto = 'SV';
          }

          p.goals = player.goals > 0 ? player.goals : 0;
          p.autogoals = player.autogoals;
        } else {
          // Player team didn't play, no substitute, leave it there
          p.events = [];
          p.autogoals = 0;
          p.goals = 0;

          // Riserva d'ufficio solo per titolari
          if (!p.fantaVoto) {
            p.fantaVoto = i < 11 ? 3 : 'SV';
          }
        }

        p.lastName = this.getLastName(p);

        if (i < 11) {
          if (this.scoreSource === 'fg') {
            p.autogoals = 0;

            score += p.events.reduce(function (acc, curr) {
              // Event ID 10 is autogol
              if (curr === '10') {
                p.autogoals += 1;
              }
              if (curr === '9' || curr === '3') {
                p.goals += 1;
              }
              return acc + (EVENTS_SCORES[parseInt(curr)] || 0);
            }, 0);

            autogol += p.autogoals || 0;
            bonus += p.fantaVoto !== 'SV' ? p.fantaVoto : 0;
          } else if (this.scoreSource === 'gds') {
            if (p.goals) {
              console.log('GOAL:', p.goals, p.Nome);
            }
            score += p.goals;
            autogol += p.autogoals || 0;
            bonus += p.fantaVoto !== 'SV' ? p.fantaVoto : 0;
          }

          if (p.goals) {
            var scorer = p.lastName.toLowerCase();
            if (p.goals > 1) {
              scorer += ' (' + p.goals + ')';
            }
            scorers.push(scorer);
          }

          if (p.autogoals) {
            autoScorers.push(p.lastName.toLowerCase() + ' (AG)');
          }

          // console.log(`${p.lastName} ${p.fantaVoto} (${p.voto}) pos(${p.pos})`)
        }

        standing.push(p);
      }

      var playersByCost = _.sortByAll(standing.slice(1, 11).filter(function (p) {
        return !!p.voto;
      }), ['fantaVoto', 'cost']);

      if (bonus > 50 && bonus <= 59.5) {
        // Additional autogol based on bonus
        var malusGoals = Math.floor((64.5 - bonus) / 5);
        autogol += malusGoals;
        for (var _i = 0; _i < malusGoals; _i++) {
          scorers.push(playersByCost.shift().lastName.toLowerCase() + ' (AG/M)');
        }
      } else if (bonus >= 67.5) {
        // Additional gol based on bonus
        var bonusGoals = Math.floor((bonus - 64.5) / 3);
        score += bonusGoals;
        for (var _i2 = 0; _i2 < bonusGoals; _i2++) {
          scorers.push(playersByCost.pop().lastName.toLowerCase() + ' (B)');
        }
      }

      return { score: score, bonus: bonus, autogol: autogol, standing: standing, scorers: scorers, autoScorers: autoScorers };
    },
    getLastName: function getLastName(player) {
      var lastName = void 0;
      if (player.lastName) {
        // If last name is already set, use it
        lastName = player.lastName;
      } else if (player.Nome) {
        // Take only the UPPERCASE part of the full name
        lastName = player.Nome.match(/^(?:[A-Z'\-]+ )+/)[0].trim();
      }

      if (!lastName) {
        console.log('no name', player);
      }
      return lastName;
    },
    getRoleLetter: function getRoleLetter(role) {
      return ROLES_LETTERS[role];
    },
    getTeamLogo: function getTeamLogo(team) {
      return '/uploads/' + team.logo;
    },
    getSerieALogo: function getSerieALogo(team) {
      return 'https://content.fantacalcio.it/web/img/team/ico/' + team.toLowerCase() + '.png';
    },
    getEventImage: function getEventImage(event) {
      var img = EVENT_IMAGES[event];
      return img ? '/images/live/' + img : null;
    },
    getEventName: function getEventName(event) {
      return EVENT_NAMES[event];
    },
    fillQueryParams: function fillQueryParams() {
      this.cGio = parseInt(getSearchParam('Gio')) || this.nextMatchId;
      this.cInco = parseInt(getSearchParam('Inco')) || null;
    }
  },
  mounted: function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      var _this6 = this;

      var season, url, i;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              season = getCookie('season');
              url = season ? '/lega?season=' + season + '&limit=1' : '/lega?active=1&limit=1';

              // fill placeholder standing

              for (i = 0; i < 25; i++) {
                this.placeholderStanding.push({
                  lastName: '-',
                  Ruolo: 0,
                  SquadraDiA: '&nbsp;'
                });
              }

              _context2.next = 5;
              return $.getJSON(url).done(function (lastPlayed) {
                var currentLeague = lastPlayed.length ? lastPlayed[0] : null;
                _this6.currentSeason = currentLeague ? currentLeague.season : null;
                _this6.nextMatchId = getSearchParam('Gio') || _this6.fantagiornataId || (currentLeague && currentLeague.nextFantagiornata ? currentLeague.nextFantagiornata.id : null);
                _this6.fillQueryParams();
              });

            case 5:
              if (this.nextMatchId) {
                _context2.next = 7;
                break;
              }

              return _context2.abrupt('return');

            case 7:
              _context2.next = 9;
              return $.getJSON('/fantagiornata/' + this.nextMatchId).done(function (fantagiornata) {
                _this6.fantagiornata = fantagiornata;
                _this6.daySerieA = fantagiornata.daySerieA;
              });

            case 9:

              window.onpopstate = function () {
                _this6.fillQueryParams();
                _this6.onChangeMatch();
              };

              _context2.next = 12;
              return $.getJSON('/fantaincontro?IDFantagiornata=' + this.cGio).then(function (matches) {
                _this6.allMatches = matches;
              });

            case 12:

              $.getJSON('/fantagiornata?where={"season":' + this.currentSeason + ',"day":{">":0}}&limit=100').then(function (giornate) {
                _this6.allFantaGiornate = giornate;
              });

              if (this.allMatches.length) {
                _context2.next = 15;
                break;
              }

              return _context2.abrupt('return');

            case 15:

              if (!this.cInco && this.showStandings) {
                this.cInco = this.allMatches[0].id;
              }

              _context2.next = 18;
              return this.loadStandings(this.cGio);

            case 18:

              // Load score from API only if this component is mounted in the live page
              if (this.calculateScore) {
                this.loadScoreData();
                if (this.live && this.cGio === this.nextMatchId) {
                  setInterval(this.loadScoreData, this.updateInterval * 1000);
                }
              } else {
                this.updateMatchScores();
              }

              this.onChangeMatch();

            case 20:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function mounted() {
      return _ref2.apply(this, arguments);
    }

    return mounted;
  }(),

  template: '\n  <div>\n    <div v-if="nextMatchId && allMatches.length" class="box">\n      <div\n        v-if="live"\n        class="is-size-5"\n        style="border-bottom:1px solid lightgrey"\n      >\n        <strong>Live</strong>\n      </div>\n\n      <div class="matches__container is-hidden-mobile">\n        <div\n          v-for="(match, i) in allMatches"\n          :key="\'match-\' + match.id"\n          class="live-match__container"\n          :class="{selected: match.id === cInco}"\n          style="margin-bottom: 0"\n          @click="setCurrentMatch(match.id)"\n        >\n          <div class="live-match__row">\n            <div class="live-match--logo" :style="{ \'background-image\': \'url(\'+getTeamLogo(match.teamHome)+\')\' }" />\n            <div class="live-match--name">\n              {{ match.teamHome.name }}\n            </div>\n            <p class="score__container" v-if="calculateScore">\n              {{ (scores[i] && scores[i].home.score >= 0) ? scores[i].home.score : \'-\' }}\n            </p>\n          </div>\n\n          <div class="live-match__row">\n            <div class="live-match--logo" :style="{ \'background-image\': \'url(\'+getTeamLogo(match.teamAway)+\')\' }" />\n            <div class="live-match--name">\n              {{ match.teamAway.name }}\n            </div>\n            <p class="score__container" v-if="calculateScore">\n              {{ (scores[i] && scores[i].away.score >= 0) ? scores[i].away.score : \'-\' }}\n            </p>\n          </div>\n        </div>\n      </div>\n\n      <nav class="panel is-borderless has-text-weight-medium is-hidden-tablet">\n        <a\n          v-for="(match, i) in allMatches"\n          :key="\'match-\' + match.id"\n          class="panel-block"\n          :class="{selected: match.id === cInco}"\n          @click="setCurrentMatch(match.id)"\n        >\n          <div style="flex: 1 1 0; text-align: right">{{ match.teamHome.name }}</div>\n          <div style="margin: 0 .5em">\n            {{ (scores[i] && scores[i].home.score >= 0) ? scores[i].home.score : (calculateScore ? \'&nbsp;\' : \'\') }} -\n            {{ (scores[i] && scores[i].away.score >= 0) ? scores[i].away.score : (calculateScore ? \'&nbsp;\' : \'\') }}\n          </div>\n          <div style="flex: 1 1 0">{{ match.teamAway.name }}</div>\n        </a>\n      </nav>\n\n      <div v-if="live" class="progress__container">\n        <div class="progress--bar" :style="{ animationDuration: updateInterval + \'s\' }"></div>\n      </div>\n    </div>\n\n    <i v-else class="has-text-dark"><small>Prossimi incontri non disponibili</small></i>\n\n    <div v-if="currentMatch && showStandings" class="box">\n      <div class="has-text-right">\n        <div class="select">\n          <select\n            v-model="cGio"\n            @input="setSearchParam(\'Gio\', $event.target.value)"\n          >\n            <option value="null">Scegli FantaGiornata</option>\n            <option\n              v-for="g in allFantaGiornate"\n              :key="\'giornata-\' + g.id"\n              :value="g.id"\n            >\n              {{ g.day }} - Campionato {{ g.girone === 1 ? \'Di Apertura\' : \'De Clausura\' }}\n            </option>\n          </select>\n        </div>\n      </div>\n\n      <div class="match-result">\n        <div class="match-result__teams">\n          <figure class="image match-result__logo">\n            <img :src="getTeamLogo(currentMatch.home.team)">\n          </figure>\n\n          <div class="match-result__teams__names">\n            <div class="match-result__team has-text-right is-hidden-touch">\n              <div class="match-result__team-name is-size-2">{{ currentMatch.home.team.name }}</div>\n              <div v-if="currentMatch.home.scorers" class="is-capitalized">\n                {{ currentMatch.home.scorers.join(\', \') }}\n              </div>\n            </div>\n\n            <div class="match-result__score is-size-2">\n              <span v-if="calculateScore">{{ currentMatch.home.score }}</span>\n              <span v-if="!calculateScore" class="is-hidden-touch">-</span>\n              <span v-if="calculateScore">-</span>\n              <span v-if="calculateScore">{{ currentMatch.away.score }}</span>\n            </div>\n\n            <div class="match-result__team has-text-left is-hidden-touch">\n              <div class="match-result__team-name is-size-2">{{ currentMatch.away.team.name }}</div>\n              <div v-if="currentMatch.away.scorers" class="is-capitalized">\n                {{ currentMatch.away.scorers.join(\', \') }}\n              </div>\n            </div>\n          </div>\n\n          <figure class="image match-result__logo">\n            <img :src="getTeamLogo(currentMatch.away.team)">\n          </figure>\n        </div>\n\n        <div class="is-flex is-hidden-desktop" style="margin-top:2em;">\n          <div class="match-result__team has-text-right" style="margin-right:.5em;">\n            <div class="match-result__team-name is-size-4-tablet is-size-5-mobile">{{ currentMatch.home.team.name }}</div>\n            <div v-if="currentMatch.home.scorers" class="is-capitalized">\n              {{ currentMatch.home.scorers.join(\', \') }}\n            </div>\n          </div>\n          <div class="match-result__team has-text-left" style="margin-left:.5em;">\n            <div class="match-result__team-name is-size-4-tablet is-size-5-mobile">{{ currentMatch.away.team.name }}</div>\n            <div v-if="currentMatch.away.scorers" class="is-capitalized">\n              {{ currentMatch.away.scorers.join(\', \') }}\n            </div>\n          </div>\n        </div>\n\n        <div v-if="calculateScore" class="match-result__bonus">\n          <div class="is-size-3 has-text-right">{{ currentMatch.home.bonus }}</div>\n          <div style="flex:0">TOTALE</div>\n          <div class="is-size-3">{{ currentMatch.away.bonus }}</div>\n        </div>\n\n        <div v-if="hasFattoreCampo">\n          <span>{{ currentMatch.FattoreCampo }}</span>\n          FATTORE CAMPO\n          <span>{{ currentMatch.FattoreCampo }}</span>\n        </div>\n\n        <div class="field is-grouped is-grouped-multiline" style="justify-content:center">\n          <div class="control">\n            <span class="tags has-addons">\n              <span class="tag is-info">{{ fantagiornata.day }}<sup>a</sup>&nbsp;<span>{{ [ \'\', \'Apertura\', \'Clausura\' ][fantagiornata.girone] }}</span></span>\n              <span class="tag">{{ fantagiornata.daySerieA }}<sup>a</sup>&nbsp;Serie A</span>\n            </span>\n          </div>\n\n          <div class="control has-text-grey">\n            {{ formattedDate }}\n          </div>\n        </div>\n      </div>\n\n      <div class="columns is-mobile">\n        <div class="column is-half match-result__standing">\n          <div class="settitolarisin has-text-centered">\n            {{ formazioneCasa.length ? \'TITOLARI\' : \'FORMAZIONE NON INSERITA\' }}\n          </div>\n\n          <template v-for="(player, j) in formazioneCasa.slice(0,playersToShow)">\n            <div\n              v-if="j === 11"\n              class="panchina-header has-text-centered"\n              :key="\'panchina-\' + j"\n            >\n              PANCHINA\n            </div>\n\n            <div\n              v-if="j === 19"\n              class="panchina-header has-text-centered"\n              :key="\'no-\' + j"\n            >\n              NON IN CAMPO\n            </div>\n\n            <div\n              :key="\'player-\' + j"\n              class="player-score"\n            >\n              <div class="player-score__container left">\n                <p><strong>{{ player.fantaVoto }}</strong></p>\n                <p>\n                  {{ player.voto }}\n                  <span v-if="player.modif" class="is-hidden-touch">({{ player.modif }})</span>\n                  <span>\n                    <img\n                      v-for="(event, e) in player.events"\n                      v-if="!!getEventImage(event)"\n                      class="player-score__icon"\n                      :title="getEventName(event)"\n                      :src="getEventImage(event)"\n                      :key="\'event-\' + e"\n                    />\n                  </span>\n                </p>\n              </div>\n\n              <div class="player-score__player has-text-right">\n                <img\n                  v-if="player.sostituto"\n                  class="player-score__icon"\n                  src="/img/sostituzione.png"\n                />\n                <span><strong>{{ player.lastName }}</strong></span>\n                <p class="player-team" v-html="player.SquadraDiA" />\n              </div>\n\n              <div class="player-score__role">\n                <span\n                  :class="\'player-role player-role--\' + player.Ruolo"\n                  v-html="getRoleLetter(player.Ruolo)" />\n              </div>\n            </div>\n          </template>\n        </div>\n\n        <div class="column is-half match-result__standing">\n          <div class="settitolarisin has-text-centered">\n            {{ formazioneFuori.length ? \'TITOLARI\' : \'FORMAZIONE NON INSERITA\' }}\n          </div>\n\n          <template v-for="(player, j) in formazioneFuori.slice(0,playersToShow)">\n            <div\n              v-if="j === 11"\n              class="panchina-header has-text-centered"\n              :key="\'panchina-\' + j"\n            >\n              PANCHINA\n            </div>\n\n            <div\n              v-if="j === 19"\n              class="panchina-header has-text-centered"\n              :key="\'no-\' + j"\n            >\n              NON IN CAMPO\n            </div>\n\n            <div\n              class="player-score"\n              :key="\'player-\' + j"\n            >\n              <div class="player-score__role">\n                <span\n                  :class="\'player-role player-role--\' + player.Ruolo"\n                  v-html="getRoleLetter(player.Ruolo)" />\n              </div>\n\n              <div class="player-score__player has-text-left">\n                <span><strong>{{ player.lastName }}</strong></span>\n                <img\n                  v-if="player.sostituto"\n                  class="player-score__icon"\n                  src="/img/sostituzione.png"\n                />\n                <p class="player-team" v-html="player.SquadraDiA" />\n              </div>\n\n              <div class="player-score__container right">\n                <p><strong>{{ player.fantaVoto }}</strong></p>\n                <p>\n                  <span>\n                    <img\n                      v-for="(event, e) in player.events"\n                      v-if="!!getEventImage(event)"\n                      class="player-score__icon"\n                      :title="getEventName(event)"\n                      :src="getEventImage(event)"\n                      :key="\'event-\' + e"\n                    />\n                  </span>\n                  <span v-if="player.modif" class="is-hidden-touch">({{ player.modif }})</span>\n                  {{ player.voto }}\n                </p>\n              </div>\n            </div>\n          </template>\n        </div>\n      </div>\n    </div>\n  </div>\n  '
});
