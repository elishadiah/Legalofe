'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

parasails.registerPage('new-campionato', {
  data: {
    allTeams: [],
    fantaGiornate: [],
    fantaIncontri: [],
    teams: []
  },
  mounted: function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var response;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return axios.get('/team');

            case 2:
              response = _context.sent;

              this.allTeams = response.data;

            case 4:
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
    fetchCalendar: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var _this = this;

        var html, giornate;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return axios.get('https://www.corrieredellosport.it/live/calendario-serie-a.html');

              case 2:
                html = _context2.sent;
                giornate = $($.parseHTML(html.data)).find('.main-column > table');


                giornate.each(function (i, el) {
                  var dates = $(el).find('tbody tr:first-child');

                  _this.fantaGiornate.push({
                    date: dates.find('th').eq(0).text().trim(),
                    daySerieA: i + 1
                  });

                  _this.fantaGiornate.push({
                    date: dates.find('th').eq(2).text().trim(),
                    daySerieA: giornate.length + i + 1
                  });

                  _this.fantaGiornate = _.sortBy(_this.fantaGiornate, 'daySerieA');
                });

              case 5:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function fetchCalendar() {
        return _ref2.apply(this, arguments);
      }

      return fetchCalendar;
    }(),
    createMatches: function createMatches() {
      for (var i = 0; i < this.teams.length; i++) {
        for (var j = 0; j < this.teams.length; j++) {
          if (i === j) {
            continue;
          }

          this.fantaIncontri.push({
            teamHome: this.teams[i].id,
            teamAway: this.teams[j].id
          });

          this.fantaIncontri.push({
            teamHome: this.teams[j].id,
            teamAway: this.teams[i].id
          });
        }
      }
    },
    onStepChange: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(step) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!(step === 1)) {
                  _context3.next = 4;
                  break;
                }

                _context3.next = 3;
                return this.fetchCalendar();

              case 3:
                this.createMatches();

              case 4:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function onStepChange(_x) {
        return _ref3.apply(this, arguments);
      }

      return onStepChange;
    }()
  }
});
