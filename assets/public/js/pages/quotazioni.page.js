'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

parasails.registerPage('quotazioni', {
  data: {
    allFantaTeams: [],
    allRoles: { P: 1, D: 2, C: 3, A: 4 },
    allTeams: [],
    filteredPlayers: [],
    filters: {},
    matches: [],
    nameSearch: null,
    players: []
  },
  mounted: function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var _this = this;

      var season, html, fantaPlayers, stats, id, player, role, allTeams, allFantaTeams;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              season = window.SAILS_LOCALS.league.season;
              _context.next = 3;
              return $.get('https://www.gazzetta.it/calcio/fantanews/statistiche/serie-a-' + season + '-' + (season - 2000 + 1));

            case 3:
              html = _context.sent;
              _context.next = 6;
              return $.get('/player?where={"IDSquadra":{">":0}}&populate=IDSquadra&limit=300');

            case 6:
              fantaPlayers = _context.sent;


              // parse html string in different document to avoid favicon to be replaced
              // with gds one
              stats = $($.parseHTML(html)).find('table.playerStats');
              id = void 0;
              player = void 0;
              role = void 0;
              allTeams = new Set();
              allFantaTeams = new Set();


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

                _this.players.push({
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
                  MP: row.eq(16).text().trim()
                });

                allTeams.add(row.eq(1).text().trim());
                if (player) {
                  allFantaTeams.add(player.IDSquadra.name);
                }
              });

              this.players = _.sortBy(this.players, 'name');

              this.allTeams = Array.from(allTeams);
              this.allFantaTeams = Array.from(allFantaTeams);

              this.updateFilter();

            case 18:
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
    getRoleNumber: function getRoleNumber(role) {
      return this.allRoles[role];
    },
    updateFilter: function updateFilter(what, value) {
      if (what) {
        if (this.filters[what]) {
          delete this.filters[what];
        } else {
          this.filters[what] = value;
        }
      }

      this.nameSearch = null;

      this.filteredPlayers = this.filters.hasOwnProperty("team")
      ? _.filter(this.players, { player: { IDSquadra: { name: value } } })
      : _.filter(this.players, this.filters);
    },
    escapeRegExp: function escapeRegExp(str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    },

    searchByName: _.debounce(function () {
      this.filters = {};
      var re = new RegExp(this.escapeRegExp(this.nameSearch), 'i');

      this.filteredPlayers = this.players.filter(function (p) {
        return !!re.test(p.name);
      });
    }, 350)
  }
});
