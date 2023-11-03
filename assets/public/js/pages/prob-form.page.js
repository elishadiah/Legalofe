'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

parasails.registerPage('prob-form-fake', {
  data: {
    matches: []
  },
  mounted: function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var html, header, container;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return $.get('https://www.gazzetta.it/Calcio/prob_form/');

            case 2:
              html = _context.sent;
              header = $('.prob-form__header');
              container = $('#prob-form');

              // parse html string in different document to avoid favicon to be replaced
              // with gds one

              $($.parseHTML(html)).find('.matchFieldContainer').each(function (i, el) {
                var match = $(el);

                var teamHome = match.find('.match .team').eq(0).text().trim();
                var teamAway = match.find('.match .team').eq(1).text().trim();

                // Set id for anchor nav
                match.attr('id', i);

                $('<div class="prob-form__match" data-match="' + i + '">\n        <div>' + teamHome + '</div><div>' + teamAway + '</div></div>').appendTo(header);

                match.find('.match').replaceWith('<div class="columns is-mobile">\n        <div class="column is-size-2-tablet is-size-3-mobile has-text-right">' + teamHome + '</div>\n        <div class="is-size-2-tablet is-size-3-mobile" style="padding:.75rem">-</div>\n        <div class="column is-size-2-tablet is-size-3-mobile">' + teamAway + '</div>\n      </div>');

                // remove link to field view
                match.find('.fieldLink').remove();

                match.addClass('box');
                match.appendTo(container);
              });

              $('.prob-form__match').click(function () {
                $(document.documentElement).animate({
                  scrollTop: $('#' + this.dataset.match).offset().top - header.outerHeight() - 50
                }, 500);
              });

            case 7:
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
  }()
});
