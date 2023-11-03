module.exports = {
  apps : [{
    name: 'lofe',
    script: 'app.js',

    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      sails_hooks__grunt: false,
      NODE_ENV: 'production'
    }
  }],

  deploy : {
    production : {
      user : 'u1894',
      host : 'legalofe.com',
      ssh_options: 'ForwardAgent=yes',
      ref  : 'origin/master',
      repo : 'git@gitlab.com:lucafaggianelli/fantalega-lofe-sails.git',
      path : '/home/u1894/fantalegalofe-sails',
      'pre-deploy' : 'git checkout -- .',
      'post-deploy' : 'npm install && pm2 startOrRestart ecosystem.config.js --env production'
    }
  }
};
