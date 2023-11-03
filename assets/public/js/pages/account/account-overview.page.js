'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

parasails.registerPage('account-overview', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    isBillingEnabled: false,

    hasBillingCard: false,

    // Syncing/loading states for this page.
    syncingOpenCheckout: false,
    syncingUpdateCard: false,
    syncingRemoveCard: false,

    // Form data
    formData: {/* … */},

    // Server error state for the form
    cloudError: '',

    // For the Stripe checkout window
    checkoutHandler: undefined,

    // For the confirmation modal:
    removeCardModalVisible: false
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function beforeMount() {
    _.extend(this, window.SAILS_LOCALS);

    this.isBillingEnabled = !!this.stripePublishableKey;

    // Determine whether there is billing info for this user.
    this.me.hasBillingCard = this.me.billingCardBrand && this.me.billingCardLast4 && this.me.billingCardExpMonth && this.me.billingCardExpYear;
  },
  mounted: function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
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

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {

    clickStripeCheckoutButton: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var _this = this;

        var billingCardInfo;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!this.syncingUpdateCard) {
                  _context2.next = 2;
                  break;
                }

                return _context2.abrupt('return');

              case 2:

                // Show syncing state for opening checkout.
                this.syncingOpenCheckout = true;

                // Clear out error states.
                this.cloudError = false;

                // Open Stripe Checkout.
                _context2.next = 6;
                return parasails.util.openStripeCheckout(this.stripePublishableKey, this.me.emailAddress);

              case 6:
                billingCardInfo = _context2.sent;

                // Clear the loading state for opening checkout.
                this.syncingOpenCheckout = false;

                if (billingCardInfo) {
                  _context2.next = 10;
                  break;
                }

                return _context2.abrupt('return');

              case 10:

                // Now that payment info has been successfully added, update the billing
                // info for this user in our backend.
                this.syncingUpdateCard = true;
                _context2.next = 13;
                return Cloud.updateBillingCard.with(billingCardInfo).tolerate(function () {
                  _this.cloudError = true;
                });

              case 13:
                this.syncingUpdateCard = false;

                // Upon success, update billing info in the UI.
                if (!this.cloudError) {
                  Object.assign(this.me, _.pick(billingCardInfo, ['billingCardLast4', 'billingCardBrand', 'billingCardExpMonth', 'billingCardExpYear']));
                  this.me.hasBillingCard = true;
                }

              case 15:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function clickStripeCheckoutButton() {
        return _ref2.apply(this, arguments);
      }

      return clickStripeCheckoutButton;
    }(),

    clickRemoveCardButton: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                this.removeCardModalVisible = true;

              case 1:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function clickRemoveCardButton() {
        return _ref3.apply(this, arguments);
      }

      return clickRemoveCardButton;
    }(),

    closeRemoveCardModal: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                this.removeCardModalVisible = false;
                this.cloudError = false;

              case 2:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function closeRemoveCardModal() {
        return _ref4.apply(this, arguments);
      }

      return closeRemoveCardModal;
    }(),

    submittedRemoveCardForm: function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:

                // Update billing info on success.
                this.me.billingCardLast4 = undefined;
                this.me.billingCardBrand = undefined;
                this.me.billingCardExpMonth = undefined;
                this.me.billingCardExpYear = undefined;
                this.me.hasBillingCard = false;

                // Close the modal and clear it out.
                this.closeRemoveCardModal();

              case 6:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function submittedRemoveCardForm() {
        return _ref5.apply(this, arguments);
      }

      return submittedRemoveCardForm;
    }(),

    handleParsingRemoveCardForm: function handleParsingRemoveCardForm() {
      return {
        // Set to empty string to indicate the default payment source
        // for this customer is being completely removed.
        stripeToken: ''
      };
    }

  }
});
