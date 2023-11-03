'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

parasails.registerComponent('cannonieri', {
  props: {
    season: {
      type: Number,
      required: true
    }
  },
  data: function data() {
    return {
      cannonieri: [],
      page: 0,
      perPage: 10,
      totalPages: 25
    };
  },
  mounted: function mounted() {
    this.loadData();
  },

  methods: {
    nextPage: function nextPage() {
      if (this.page > this.totalPages - 1) {
        return;
      }
      this.page++;
      this.loadData();
    },
    prevPage: function prevPage() {
      if (this.page <= 0) {
        return;
      }
      this.page--;
      this.loadData();
    },
    loadData: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return $.getJSON('/album?season=' + this.season + '&sort=goals DESC&sort=id&limit=' + this.perPage + '&skip=' + this.page * this.perPage);

              case 2:
                this.cannonieri = _context.sent;

              case 3:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function loadData() {
        return _ref.apply(this, arguments);
      }

      return loadData;
    }()
  },
  template: '<div v-if="cannonieri.length">\n  <nav class="panel is-borderless">\n    <a\n      v-for="(album, i) in cannonieri"\n      :key="album.id"\n      class="panel-block"\n      :href="album.team && album.player ? \'/rose/\' + album.team.id + \'#\' + album.player.id : null"\n    >\n      <div class="has-text-right" style="width: 25px;margin-right: 8px;">\n        {{ page * perPage + i + 1 }}\n      </div>\n\n      <div class="has-text-truncated" style="flex:1">\n        <span class="has-text-weight-medium">{{ album.player.Nome }}</span>\n        <small v-if="album.team" class="has-text-grey">{{ album.team.name }}</small>\n      </div>\n\n      <div class="has-text-right has-text-weight-medium">{{ album.goals }}</div>\n    </a>\n  </nav>\n\n  <div\n    class="is-flex"\n    style="justify-content: space-around; align-items: center"\n  >\n    <button\n      :disabled="page <= 0"\n      class="button"\n      @click="prevPage()"\n    >\n      <span class="icon is-small">\n        <i class="fa fa-angle-left"></i>\n      </span>\n    </button>\n\n    <span class="has-text-grey">\n      {{ page + 1 }} / {{ totalPages }}\n    </span>\n\n    <button\n      :disabled="page > (totalPages - 1)"\n      class="button"\n      @click="nextPage()"\n    >\n      <span class="icon is-small">\n        <i class="fa fa-angle-right"></i>\n      </span>\n    </button>\n  </div>\n</div>\n\n<small v-else>\n  <i>Nessun giocatore trovato</i>\n</small>'
});
