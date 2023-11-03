'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

parasails.registerComponent('top-flop-11', {
  data: function data() {
    return {
      activeTab: 0,
      allSchieramenti: [[1, 4, 3, 3], [1, 5, 3, 2], [1, 3, 4, 3], [1, 4, 4, 2]],
      schieramento: null,
      allTop11: null,
      allFlop11: null
    };
  },

  computed: {
    flop11: function flop11() {
      var _this = this;

      if (!this.schieramento || !this.allFlop11) {
        return [];
      }

      var ret = [];

      var _loop = function _loop(i) {
        var byRole = _this.allFlop11.filter(function (x) {
          return x.player.Ruolo === i + 1;
        });
        byRole = _.sortBy(byRole, 'fantaVoto').slice(0, _this.schieramento[i]);
        ret = ret.concat(byRole);
        ret.forEach(function (x) {
          x.player.team = _this.teams.find(function (t) {
            return t.id === x.player.IDSquadra;
          });
        });
      };

      for (var i = 0; i < this.schieramento.length; i++) {
        _loop(i);
      }

      return ret;
    },
    top11: function top11() {
      var _this2 = this;

      if (!this.schieramento || !this.allTop11) {
        return [];
      }

      var ret = [];

      var _loop2 = function _loop2(i) {
        var byRole = _this2.allTop11.filter(function (x) {
          return x.player.Ruolo === i + 1;
        });
        byRole = _.sortBy(byRole, 'fantaVoto').reverse().slice(0, _this2.schieramento[i]);

        ret = ret.concat(byRole);
        ret.forEach(function (x) {
          x.player.team = _this2.teams.find(function (t) {
            return t.id === x.player.IDSquadra;
          });
        });
      };

      for (var i = 0; i < this.schieramento.length; i++) {
        _loop2(i);
      }

      return ret;
    }
  },
  mounted: function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var lega;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              this.schieramento = this.allSchieramenti[2];

              lega = window.SAILS_LOCALS.league;

              this.teams = lega.teams;

              if (lega.fantagiornata) {
                _context.next = 5;
                break;
              }

              return _context.abrupt('return');

            case 5:
              _context.next = 7;
              return $.getJSON('/topflop?day=' + lega.fantagiornata.id + '&type=top&populate=player');

            case 7:
              this.allTop11 = _context.sent;
              _context.next = 10;
              return $.getJSON('/topflop?day=' + lega.fantagiornata.id + '&type=flop&populate=player');

            case 10:
              this.allFlop11 = _context.sent;

            case 11:
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

  template: '\n<div>\n  <div class="columns is-hidden-mobile">\n    <div class="column is-half">\n      <h2 class="is-size-4 has-text-centered">TOP 11</h2>\n\n      <nav class="panel is-borderless">\n        <div\n          v-for="entry in top11"\n          :key="\'topflop-\' + entry.id"\n          class="panel-block"\n        >\n          <player-role :role="entry.player.Ruolo" />\n\n          <div class="top-flop__player-name has-text-truncated">\n            <span class="has-text-weight-medium">{{ entry.player.Nome }}</span>\n            <small class="has-text-grey">{{ entry.player.team.name }}</small>\n          </div>\n\n          <strong>{{ entry.fantaVoto }}</strong>\n        </div>\n      </nav>\n    </div>\n\n    <div class="column is-half">\n      <h2 class="is-size-4 has-text-centered">FLOP 11</h2>\n\n      <nav class="panel is-borderless">\n        <div\n          v-for="entry in flop11"\n          :key="\'topflop-\' + entry.id"\n          class="panel-block"\n        >\n          <player-role :role="entry.player.Ruolo" />\n\n          <div class="top-flop__player-name has-text-truncated">\n            <span class="has-text-weight-medium">{{ entry.player.Nome }}</span>\n            <small class="has-text-grey">{{ entry.player.team.name }}</small>\n          </div>\n\n          <strong>{{ entry.fantaVoto }}</strong>\n        </div>\n      </nav>\n    </div>\n  </div>\n\n  <b-tabs\n    v-model="activeTab"\n    position="is-centered"\n    class="is-hidden-tablet"\n  >\n    <b-tab-item label="TOP 11">\n      <nav class="panel is-borderless">\n        <div\n          v-for="entry in top11"\n          :key="\'topflop-\' + entry.id"\n          class="panel-block"\n        >\n          <player-role :role="entry.player.Ruolo" />\n\n          <div class="top-flop__player-name has-text-truncated">\n            <span class="has-text-weight-medium">{{ entry.player.Nome }}</span>\n            <small class="has-text-grey">{{ entry.player.team.name }}</small>\n          </div>\n\n          <strong>{{ entry.fantaVoto }}</strong>\n        </div>\n      </nav>\n    </b-tab-item>\n\n    <b-tab-item label="FLOP 11">\n      <nav class="panel is-borderless">\n        <div\n          v-for="entry in flop11"\n          :key="\'topflop-\' + entry.id"\n          class="panel-block"\n        >\n          <player-role :role="entry.player.Ruolo" />\n\n          <div class="top-flop__player-name has-text-truncated">\n            <span class="has-text-weight-medium">{{ entry.player.Nome }}</span>\n            <small class="has-text-grey">{{ entry.player.team.name }}</small>\n          </div>\n\n          <strong>{{ entry.fantaVoto }}</strong>\n        </div>\n      </nav>\n    </b-tab-item>\n  </b-tabs>\n\n  <div class="buttons has-addons is-centered">\n    <span\n      v-for="s in allSchieramenti"\n      :key="\'s-\' + s.join(\'-\')"\n      class="button"\n      :class="schieramento === s ? \'is-active is-info\' : \'\'"\n      @click="schieramento = s"\n    >\n      {{ s.slice(1,4).join(\'-\') }}\n    </span>\n  </div>\n</div>\n  '
});
