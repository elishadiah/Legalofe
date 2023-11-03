'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * <js-timestamp>
 * -----------------------------------------------------------------------------
 * A human-readable, self-updating "timeago" timestamp, with some special rules:
 *
 * • Within 24 hours, displays in "timeago" format.
 * • Within a month, displays month, day, and time of day.
 * • Within a year, displays just the month and day.
 * • Older/newer than that, displays the month and day with the full year.
 *
 * @type {Component}
 * -----------------------------------------------------------------------------
 */

parasails.registerComponent('jsTimestamp', {

  //  ╔═╗╦═╗╔═╗╔═╗╔═╗
  //  ╠═╝╠╦╝║ ║╠═╝╚═╗
  //  ╩  ╩╚═╚═╝╩  ╚═╝
  props: ['at', // « The JS timestamp to format
  'short', // « Whether to shorten the formatted date by not including the time of day (may only be used with timeago, and even then only applicable in certain situations)
  'format'],

  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: function data() {
    return {
      formatType: undefined,
      formattedTimestamp: '',
      interval: undefined
    };
  },

  //  ╦ ╦╔╦╗╔╦╗╦
  //  ╠═╣ ║ ║║║║
  //  ╩ ╩ ╩ ╩ ╩╩═╝
  template: '\n  <span>{{formattedTimestamp}}</span>\n  ',

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function beforeMount() {
    var _this = this;

    if (this.at === undefined) {
      throw new Error('Incomplete usage of <js-timestamp>:  Please specify `at` as a JS timestamp (i.e. epoch ms, a number).  For example: `<js-timestamp :at="something.createdAt">`');
    }
    if (this.format === undefined) {
      this.formatType = 'timeago';
    } else {
      if (!_.contains(['calendar', 'timeago'], this.format)) {
        throw new Error('Unsupported `format` (' + this.format + ') passed in to the JS timestamp component! Must be either \'calendar\' or \'timeago\'.');
      }
      this.formatType = this.format;
    }

    // If timeago timestamp, update the timestamp every minute.
    if (this.formatType === 'timeago') {
      this._formatTimeago();
      this.interval = setInterval(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;

                _this._formatTimeago();
                _context.next = 4;
                return _this.forceRender();

              case 4:
                _context.next = 10;
                break;

              case 6:
                _context.prev = 6;
                _context.t0 = _context['catch'](0);

                _context.t0.raw = _context.t0;
                throw new Error('Encountered unexpected error while attempting to automatically re-render <js-timestamp> in the background, as the seconds tick by.  ' + _context.t0.message);

              case 10:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this, [[0, 6]]);
      })), 60 * 1000); //œ
    }

    // If calendar timestamp, just set it the once.
    // (Also don't allow usage with `short`.)
    if (this.formatType === 'calendar') {
      this.formattedTimestamp = moment(this.at).format('MM-DD-YYYY');
      if (this.short) {
        throw new Error('Invalid usage of <js-timestamp>:  Cannot use `short="true"` at the same time as `format="calendar"`.');
      }
    }
  },

  beforeDestroy: function beforeDestroy() {
    if (this.formatType === 'timeago') {
      clearInterval(this.interval);
    }
  },

  watch: {
    at: function at() {
      // Render to account for after-mount programmatic changes to `at`.
      if (this.formatType === 'timeago') {
        this._formatTimeago();
      } else if (this.formatType === 'calendar') {
        this.formattedTimestamp = moment(this.at).format('MM-DD-YYYY');
      } else {
        throw new Error();
      }
    }
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {

    _formatTimeago: function _formatTimeago() {
      var now = new Date().getTime();
      var timeDifference = Math.abs(now - this.at);

      // If the timestamp is less than a day old, format as time ago.
      if (timeDifference < 1000 * 60 * 60 * 24) {
        this.formattedTimestamp = moment(this.at).fromNow();
      } else {
        // If the timestamp is less than a month-ish old, we'll include the
        // time of day in the formatted timestamp.
        var includeTime = !this.short && timeDifference < 1000 * 60 * 60 * 24 * 31;

        // If the timestamp is from a different year, we'll include the year
        // in the formatted timestamp.
        var includeYear = moment(now).format('YYYY') !== moment(this.at).format('YYYY');

        this.formattedTimestamp = moment(this.at).format('MMMM DD' + (includeYear ? ', YYYY' : '') + (includeTime ? ' [at] h:mma' : ''));
      }
    }

  }

});
