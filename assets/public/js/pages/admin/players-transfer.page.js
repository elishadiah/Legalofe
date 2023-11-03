'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

parasails.registerPage('players-transfer', {
  data: {
    allRoles: { P: 1, D: 2, C: 3, A: 4 },
    cost: 0,
    loading: false,
    players: [],
    player: null,
    selectedTeam: null,
    searchTeam: '',
    team: null,
    teams: [],

    loadingUpdates: false,
    loadingNew: false,
    loadingTransfers: false,
    updatesNew: [],
    updatesTransfers: [],
    updatesRun: false,

    fileSelected: false,
    uploadingPhotos: false
  },
  mounted: function mounted() {
    this.teams = window.SAILS_LOCALS.league.teams;
  },

  computed: {
    teamsFiltered: function teamsFiltered() {
      var _this = this;

      return this.teams.filter(function (option) {
        if (_this.player && _this.player.IDSquadra && _this.player.IDSquadra.id === option.id) {
          return false;
        }

        return option.name.toString().toLowerCase().indexOf(_this.searchTeam.toLowerCase()) >= 0;
      });
    }
  },
  methods: {
    getAsyncData: _.debounce(function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(name) {
        var where, url, players;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (name.length) {
                  _context.next = 3;
                  break;
                }

                this.players = [];
                return _context.abrupt('return');

              case 3:

                this.loading = true;

                where = { Nome: { contains: name } };
                url = '/player?where=' + JSON.stringify(where) + '&populate=IDSquadra';
                _context.prev = 6;
                _context.next = 9;
                return $.getJSON(url);

              case 9:
                players = _context.sent;

                this.players = _.sortBy(players, 'IDSquadra.id');
                _context.next = 17;
                break;

              case 13:
                _context.prev = 13;
                _context.t0 = _context['catch'](6);

                this.players = [];
                throw _context.t0;

              case 17:
                _context.prev = 17;

                this.loading = false;
                return _context.finish(17);

              case 20:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[6, 13, 17, 20]]);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }(), 500),
    transferPlayer: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(svincola) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;
                _context2.next = 3;
                return $.ajax({
                  type: 'POST',
                  url: '/player/' + this.player.id + '/transfer',
                  data: JSON.stringify({
                    team: svincola ? null : this.team.id,
                    cost: this.cost,
                    _csrf: window.SAILS_LOCALS._csrf
                  }),
                  contentType: 'application/json',
                  dataType: 'json'
                });

              case 3:

                this.$buefy.notification.open({
                  message: this.player.Nome + ' \xE8 stato ' + (svincola ? 'svincolato' : 'trasferito') + ' correttamente',
                  type: 'is-success'
                });

                this.cost = 0;
                this.player = null;
                this.team = null;
                this.searchTeam = '';
                _context2.next = 13;
                break;

              case 10:
                _context2.prev = 10;
                _context2.t0 = _context2['catch'](0);

                this.$buefy.notification.open({
                  message: 'Errore: ' + _context2.t0.message,
                  type: 'is-danger'
                });

              case 13:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this, [[0, 10]]);
      }));

      function transferPlayer(_x2) {
        return _ref2.apply(this, arguments);
      }

      return transferPlayer;
    }(),
    findUpdates: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var _this2 = this;

        var season, html, fantaPlayers, stats, id, player, role, gdsPlayer;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                this.loadingUpdates = true;

                this.updatesNew = [];
                this.updatesTransfers = [];

                season = window.SAILS_LOCALS.league.season;
                _context3.next = 6;
                return axios.get('https://www.gazzetta.it/calcio/fantanews/statistiche/serie-a-' + season + '-' + (season - 2000 + 1));

              case 6:
                html = _context3.sent.data;
                _context3.next = 9;
                return axios.get('/player?populate=IDSquadra&limit=5000');

              case 9:
                fantaPlayers = _context3.sent.data;


                // parse html string in different document to avoid favicon to be replaced
                // with gds one
                stats = $($.parseHTML(html)).find('table.playerStats');
                id = void 0;
                player = void 0;
                role = void 0;
                gdsPlayer = void 0;


                stats.find('tbody tr').each(function (i, el) {
                  var row = $(el).find('td');

                  id = row.eq(2).find('a').attr('href');
                  if (id) {
                    id = parseInt(id.replace(/\/$/g, '').split('/').pop());
                  }

                  if (id) {
                    player = fantaPlayers.find(function (x) {
                      return x.IDGazzetta === id;
                    });
                  } else {
                    player = null;
                  }

                  role = row.eq(3).text().trim();
                  if (role.length > 1) {
                    role = role[3];
                  }

                  gdsPlayer = {
                    id: id,
                    teamA: row.eq(1).text().trim(),
                    player: player,
                    name: row.eq(2).text().trim(),
                    role: role,
                    Q: row.eq(4).text().trim(),
                    PG: row.eq(5).text().trim(),
                    G: row.eq(6).text().trim(),
                    A: row.eq(7).text().trim(),
                    AM: row.eq(8).text().trim(),
                    ES: row.eq(9).text().trim(),
                    RT: row.eq(10).text().trim(),
                    RR: row.eq(11).text().trim(),
                    RS: row.eq(12).text().trim(),
                    RP: row.eq(13).text().trim(),
                    MV: row.eq(14).text().trim(),
                    MM: row.eq(15).text().trim(),
                    MP: row.eq(16).text().trim(),
                    _loading: false
                  };

                  gdsPlayer.teamA = gdsPlayer.teamA[0].toUpperCase() + gdsPlayer.teamA.slice(1);

                  if (!player) {
                    _this2.updatesNew.push(gdsPlayer);
                  } else if (player.SquadraDiA.toLowerCase() !== gdsPlayer.teamA.toLowerCase()) {
                    _this2.updatesTransfers.push(gdsPlayer);
                  }
                });

                this.updatesNew = _.sortBy(this.updatesNew, 'name');
                this.updatesTransfers = _.sortBy(this.updatesTransfers, 'name');

                this.loadingUpdates = false;
                this.updatesRun = true;

              case 20:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function findUpdates() {
        return _ref3.apply(this, arguments);
      }

      return findUpdates;
    }(),
    importPlayer: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(player) {
        var i;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                player._loading = true;

                _context4.prev = 1;
                _context4.next = 4;
                return axios.post('/player', {
                  SquadraDiA: player.teamA,
                  Ruolo: this.getRoleNumber(player.role),
                  Nome: player.name,
                  IDGazzetta: player.id,
                  cost: player.Q,
                  _csrf: window.SAILS_LOCALS._csrf
                });

              case 4:
                this.$buefy.notification.open({
                  message: player.name + ' \xE8 stato importato correttamente',
                  type: 'is-success'
                });
                _context4.next = 11;
                break;

              case 7:
                _context4.prev = 7;
                _context4.t0 = _context4['catch'](1);

                this.$buefy.notification.open({
                  message: 'Non \xE8 possibile importare ' + player.name,
                  type: 'is-danger'
                });
                console.error(_context4.t0);

              case 11:
                i = this.updatesNew.findIndex(function (item) {
                  return item.id === player.id;
                });

                this.updatesNew.splice(i, 1);

                player._loading = false;

              case 14:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this, [[1, 7]]);
      }));

      function importPlayer(_x3) {
        return _ref4.apply(this, arguments);
      }

      return importPlayer;
    }(),
    updatePlayer: function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(player) {
        var i;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                player._loading = true;

                _context5.prev = 1;
                _context5.next = 4;
                return axios.patch('/player/' + player.player.id, {
                  SquadraDiA: player.teamA,
                  _csrf: window.SAILS_LOCALS._csrf
                });

              case 4:
                this.$buefy.notification.open({
                  message: player.name + ' \xE8 stato aggiornato correttamente',
                  type: 'is-success'
                });
                _context5.next = 11;
                break;

              case 7:
                _context5.prev = 7;
                _context5.t0 = _context5['catch'](1);

                this.$buefy.notification.open({
                  message: 'Non \xE8 possibile aggiornare ' + player.name,
                  type: 'is-danger'
                });
                console.error(_context5.t0);

              case 11:
                i = this.updatesTransfers.findIndex(function (item) {
                  return item.id === player.id;
                });

                this.updatesTransfers.splice(i, 1);

                player.loadingTransfers = false;

              case 14:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this, [[1, 7]]);
      }));

      function updatePlayer(_x4) {
        return _ref5.apply(this, arguments);
      }

      return updatePlayer;
    }(),
    getRoleNumber: function getRoleNumber(role) {
      return this.allRoles[role];
    },
    uploadPhotos: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
        var data, response;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                if (this.$refs.fileInput.files[0]) {
                  _context6.next = 2;
                  break;
                }

                return _context6.abrupt('return');

              case 2:

                this.uploadingPhotos = true;
                data = new FormData();

                data.append('_csrf', window.SAILS_LOCALS._csrf);
                data.append('photos', this.$refs.fileInput.files[0]);

                _context6.prev = 6;
                _context6.next = 9;
                return axios.post('/admin/upload-players-photos', data);

              case 9:
                response = _context6.sent;


                this.$buefy.notification.open({
                  message: 'Sono state caricate ' + response.data.foundPhotos + ' foto',
                  type: 'is-success'
                });
                _context6.next = 16;
                break;

              case 13:
                _context6.prev = 13;
                _context6.t0 = _context6['catch'](6);

                this.$buefy.notification.open({
                  message: 'Non \xE8 stato possibile aggiornare le foto: ' + _context6.t0.toString(),
                  type: 'is-danger'
                });

              case 16:
                _context6.prev = 16;

                this.uploadingPhotos = false;
                return _context6.finish(16);

              case 19:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this, [[6, 13, 16, 19]]);
      }));

      function uploadPhotos() {
        return _ref6.apply(this, arguments);
      }

      return uploadPhotos;
    }(),
    onFileChange: function onFileChange() {
      this.fileSelected = this.$refs.fileInput ? this.$refs.fileInput.files.length === 1 : false;
    }
  }
});
