/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {

  // Most of the website is open
  '*': true,

  'invio-formazione': {
    index: 'is-logged-in',
    create: 'is-team-manager'
  },
  'rose': {
    'edit': 'is-team-manager',
    'update': 'is-team-manager',
    '*': true
  },

  'player': {
    '*': 'is-super-admin',
    'find': true,
    'findOne': true
  },

  'lega': {
    '*': 'is-super-admin',
    'find': true,
    'findOne': true
  },

  'account': {
    '*': 'is-logged-in',
    'logout': true
  },

  'admin': {
    '*': 'is-super-admin'
  }
};
