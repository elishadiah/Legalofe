'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

parasails.registerComponent('player-picker', {
  props: {
    return: {
      type: String,
      default: 'id'
    },
    value: {
      type: [Object, String, Number],
      required: false,
      default: null
    }
  },
  data: function data() {
    return {
      loading: false,
      players: []
    };
  },

  computed: {
    selectedPlayer: {
      get: function get() {
        return this.value;
      },
      set: function set(val) {
        this.$emit('input', val);
      }
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
    }(), 500)
  },
  template: '\n    <b-autocomplete\n      ref="autocomplete"\n      :data="players"\n      field="Nome"\n      placeholder="Giocatore"\n      :loading="loading"\n      @select="option => { selectedPlayer = option[this.return]; this.$refs.autocomplete.$el.querySelector(\'input\').focus() }"\n      @typing="getAsyncData"\n    >\n      <template slot-scope="{ option }">\n        <div class="media">\n          <div class="media-left">\n            <img width="32" :src="\'/uploads/foto/\' + option.Codice + \'.png\'">\n          </div>\n\n          <div class="media-content">\n            <strong>{{ option.Nome }}</strong>\n\n            <div>\n              <span v-if="option.IDSquadra">{{ option.IDSquadra.name }}</span>\n              <span v-else>Nessna Squadra</span>\n\n              &bull; {{ option.SquadraDiA }} &bull; $ {{ option.cost }}\n            </div>\n          </div>\n        </div>\n      </template>\n    </b-autocomplete>'
});
