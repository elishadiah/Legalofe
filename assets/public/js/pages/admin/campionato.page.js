'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

parasails.registerPage('admin-campionato', {
  filters: {
    fmtDate: function fmtDate(dateString) {
      var MESI = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
      var GIORNI = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

      var date = new Date(dateString);

      return GIORNI[date.getDay()] + ' ' + date.getDate() + ' ' + MESI[date.getMonth()] + ' ' + date.getFullYear();
    }
  },
  data: {
    allFantaGiornate: [],
    calcDay: null,
    isDialogOpen: false,
    columns: [{
      field: 'day',
      label: 'Fanta Giornata',
      centered: true
    }, {
      field: 'daySerieA',
      label: 'Giornata A',
      centered: true
    }, {
      field: 'girone',
      label: 'Girone',
      centered: true
    }, {
      field: 'date',
      label: 'Data',
      centered: true
    }, {
      field: 'deadline',
      label: 'Scadenza',
      centered: true
    }, {
      field: '',
      label: 'Calcolata',
      centered: true
    }, {
      field: 'locked',
      label: 'Invio Form',
      centered: true
    }],
    league: null,
    loading: false,
    response: null,
    scores: {},
    selected: null,
    seiPolitico: false,
    teamToAdd: null
  },
  mounted: function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var _this = this;

      var w, response;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              this.league = SAILS_LOCALS.league;

              this.loading = true;

              w = JSON.stringify({
                season: this.league.season,
                day: { '>': 0 }
              });
              _context.next = 5;
              return axios.get('/fantagiornata?where=' + w + '&sort=girone ASC&sort=day ASC&limit=100');

            case 5:
              response = _context.sent;


              this.loading = false;

              this.allFantaGiornate = response.data.map(function (fg) {
                fg.date = fg.date ? new Date(fg.date) : null;
                fg.deadline = fg.deadline ? new Date(fg.deadline) : null;
                return fg;
              });
              this.selected = this.allFantaGiornate.find(function (fg) {
                return fg.id === _this.league.nextFantagiornata.id;
              });

            case 9:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function mounted() {
      return _ref.apply(this, arguments);
    }

    return mounted;
  }(),

  methods: {
    lockFantaGiornata: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(fgId, locked) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return axios.patch('/fantagiornata/' + fgId, {
                  locked: locked,
                  _csrf: window.SAILS_LOCALS._csrf
                });

              case 2:

                window.location.reload();

              case 3:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function lockFantaGiornata(_x, _x2) {
        return _ref2.apply(this, arguments);
      }

      return lockFantaGiornata;
    }(),
    saltaGiornata: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(fgId) {
        var nextIndex;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                nextIndex = this.allFantaGiornate.findIndex(function (fg) {
                  return fg.id === fgId;
                }) + 1;

                if (this.allFantaGiornate[nextIndex]) {
                  _context3.next = 3;
                  break;
                }

                return _context3.abrupt('return');

              case 3:
                _context3.next = 5;
                return axios.patch('/lega/' + window.SAILS_LOCALS.league.id, {
                  nextFantagiornata: this.allFantaGiornate[nextIndex].id,
                  _csrf: window.SAILS_LOCALS._csrf
                });

              case 5:

                window.location.reload();

              case 6:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function saltaGiornata(_x3) {
        return _ref3.apply(this, arguments);
      }

      return saltaGiornata;
    }(),
    calcolaGiornata: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(day) {
        var scores = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var force = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        var response;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (day) {
                  _context4.next = 2;
                  break;
                }

                return _context4.abrupt('return');

              case 2:
                this.loading = true;
                this.response = null;

                _context4.prev = 4;
                _context4.next = 7;
                return axios.post('/admin/calcola-giornata', {
                  day: day,
                  force: force,
                  scores: scores,
                  _csrf: window.SAILS_LOCALS._csrf
                });

              case 7:
                response = _context4.sent;

                this.response = response.data;

                this.$buefy.notification.open({
                  message: 'Giornata calcolata correttamente',
                  type: 'is-success'
                });
                _context4.next = 16;
                break;

              case 12:
                _context4.prev = 12;
                _context4.t0 = _context4['catch'](4);

                this.response = null;
                this.$buefy.notification.open({
                  message: 'Giornata non calcolata. ' + _context4.t0,
                  type: 'is-danger'
                });

              case 16:
                _context4.prev = 16;

                this.loading = false;
                return _context4.finish(16);

              case 19:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this, [[4, 12, 16, 19]]);
      }));

      function calcolaGiornata(_x6) {
        return _ref4.apply(this, arguments);
      }

      return calcolaGiornata;
    }(),
    fmtDate: function fmtDate(date) {
      return date.toLocaleDateString('it', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
      });
    },
    fmtDateTime: function fmtDateTime(date) {
      return date.toLocaleString('it', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'
      });
    },
    openDialog: function openDialog(day) {
      this.calcDay = day;
      this.isDialogOpen = true;
    },
    saveFg: function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(i) {
        var data;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                data = Object.assign({}, this.allFantaGiornate[i]);

                data.date = data.date.toISOString().slice(0, 10);
                data.deadline = data.deadline.toISOString();
                delete data.matches;
                data._csrf = SAILS_LOCALS._csrf;

                _context5.prev = 5;
                _context5.next = 8;
                return axios.patch('/fantagiornata/' + this.allFantaGiornate[i].id, data);

              case 8:

                this.$buefy.notification.open({
                  message: 'Giornata salvata',
                  type: 'is-success'
                });
                _context5.next = 14;
                break;

              case 11:
                _context5.prev = 11;
                _context5.t0 = _context5['catch'](5);

                this.$buefy.notification.open({
                  message: 'Giornata non salvata correttamente. ' + _context5.t0,
                  type: 'is-danger'
                });

              case 14:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this, [[5, 11]]);
      }));

      function saveFg(_x7) {
        return _ref5.apply(this, arguments);
      }

      return saveFg;
    }(),
    updateFantaVoto: function updateFantaVoto(score) {
      score.fantaVoto = score.voto + score.assists * 1 - score.ammonizioni * 0.5 - score.espulsioni * 1 - score.failedPenalties * 3;
    }
  }
});
