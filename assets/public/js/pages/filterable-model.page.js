'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

parasails.registerPage('xxx', {
  data: {
    filter: [],
    loading: false,
    nameSearch: null,
    page: 0,
    pageSize: 50,
    paginationEnd: false,
    players: []
  },
  methods: {
    fetchPlayers: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var append = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        var url, where, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, f, fObj, players;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.loading = true;

                url = '/player?sort=Nome ASC&populate=false';
                where = {};

                // pagination

                url += '&limit=' + this.pageSize + '&skip=' + this.page * this.pageSize;

                // only players with a team
                where.IDSquadra = { '>': 0

                  // filter
                };
                if (!this.filter.length) {
                  _context.next = 26;
                  break;
                }

                where.or = [];
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context.prev = 10;
                for (_iterator = this.filter[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                  f = _step.value;
                  fObj = {};

                  fObj[f.split('=')[0]] = f.split('=')[1];
                  where.or.push(fObj);
                }
                _context.next = 18;
                break;

              case 14:
                _context.prev = 14;
                _context.t0 = _context['catch'](10);
                _didIteratorError = true;
                _iteratorError = _context.t0;

              case 18:
                _context.prev = 18;
                _context.prev = 19;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 21:
                _context.prev = 21;

                if (!_didIteratorError) {
                  _context.next = 24;
                  break;
                }

                throw _iteratorError;

              case 24:
                return _context.finish(21);

              case 25:
                return _context.finish(18);

              case 26:

                if (this.nameSearch) {
                  where.Nome = { contains: this.nameSearch };
                }

                url += '&where=' + JSON.stringify(where);

                _context.next = 30;
                return $.getJSON(url);

              case 30:
                players = _context.sent;


                this.paginationEnd = players.length < this.pageSize;

                if (append) {
                  this.players = this.players.concat(players);
                } else {
                  this.players = players;
                }

                this.loading = false;

              case 34:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[10, 14, 18, 26], [19,, 21, 25]]);
      }));

      function fetchPlayers() {
        return _ref.apply(this, arguments);
      }

      return fetchPlayers;
    }(),
    toggleFilter: function toggleFilter(value) {
      var index = this.filter.indexOf(value);

      if (index > -1) {
        this.filter.splice(index, 1);
      } else {
        this.filter.push(value);
      }

      this.nameSearch = '';
      this.players = [];
      this.page = 0;

      this.fetchPlayers();
    },
    searchByName: function searchByName() {
      this.filter = [];
      this.players = [];

      this.fetchPlayers();
    },
    infiniteScroll: function infiniteScroll() {
      if (window.scrollY > document.querySelector('#quotazioni').offsetHeight - window.outerHeight && !this.loading && !this.paginationEnd) {
        this.page++;
        this.fetchPlayers(true);
      }
    }
  },
  mounted: function mounted() {
    this.fetchPlayers();

    window.addEventListener('scroll', this.infiniteScroll);
  },
  beforeDestroy: function beforeDestroy() {
    window.removeEventListener('scroll', this.infiniteScroll);
  }
});
