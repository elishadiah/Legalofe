const ROLES = [ undefined, 'P', 'D', 'C', 'A' ]

module.exports = {
  friendlyName: 'Get player role',
  description: '',
  sync: true,

  inputs: {
    roleId: { type: 'number', required: true }
  },

  exits: {
    success: {
      outputFriendlyName: 'Player role',
    }
  },

  fn: function (inputs) {
    return ROLES[inputs.roleId]
  }
};

