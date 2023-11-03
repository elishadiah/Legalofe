/**
 * `tasks/config/sails-linker`
 *
 * ---------------------------------------------------------------
 *
 * Automatically inject <script> tags and <link> tags into the specified
 * specified HTML and/or EJS files.  The specified delimiters (`startTag`
 * and `endTag`) determine the insertion points.
 *
 * For more information, see:
 *   https://sailsjs.com/anatomy/tasks/config/sails-linker.js
 *
 */
const { version } = require('../../package.json')
global.productionJSName = '.tmp/public/min/production-' + version + '.min.js';
global.productionCSSName = '.tmp/public/min/production-' + version + '.min.css';

module.exports = function(grunt) {
  const productionJSName = global.productionJSName
  const productionCSSName = global.productionCSSName

  grunt.config.set('sails-linker', {


    //   ╦╔═╗╦  ╦╔═╗╔═╗╔═╗╦═╗╦╔═╗╔╦╗
    //   ║╠═╣╚╗╔╝╠═╣╚═╗║  ╠╦╝║╠═╝ ║
    //  ╚╝╩ ╩ ╚╝ ╩ ╩╚═╝╚═╝╩╚═╩╩   ╩
    //  ┌─    ┌─┐┬  ┬┌─┐┌┐┌┌┬┐  ┌─┐┬┌┬┐┌─┐   ┬┌─┐┬  ┬┌─┐┌─┐┌─┐┬─┐┬┌─┐┌┬┐    ─┐
    //  │───  │  │  │├┤ │││ │───└─┐│ ││├┤    │├─┤└┐┌┘├─┤└─┐│  ├┬┘│├─┘ │   ───│
    //  └─    └─┘┴─┘┴└─┘┘└┘ ┴   └─┘┴─┴┘└─┘  └┘┴ ┴ └┘ ┴ ┴└─┘└─┘┴└─┴┴   ┴     ─┘
    devJs: {
      options: {
        startTag: '<!--SCRIPTS-->',
        endTag: '<!--SCRIPTS END-->',
        fileTmpl: '<script src="%s"></script>',
        appRoot: '.tmp/public'
      },
      files: {
        '.tmp/public/**/*.html': require('../pipeline').jsFilesToInject,
        'views/**/*.html': require('../pipeline').jsFilesToInject,
        'views/**/*.ejs': require('../pipeline').jsFilesToInject
      }
    },

    devJsBuild: {
      options: {
        startTag: '<!--SCRIPTS-->',
        endTag: '<!--SCRIPTS END-->',
        fileTmpl: '<script src="%s"></script>',
        appRoot: '.tmp/public',
        // relative: true
        // ^^ Uncomment this if compiling assets for use in PhoneGap, CDN, etc.
        //    (but be note that this can break custom font URLs)
      },
      files: {
        '.tmp/public/**/*.html': require('../pipeline').jsFilesToInject,
        'views/**/*.html': require('../pipeline').jsFilesToInject,
        'views/**/*.ejs': require('../pipeline').jsFilesToInject
      }
    },

    prodJs: {
      options: {
        startTag: '<!--SCRIPTS-->',
        endTag: '<!--SCRIPTS END-->',
        fileTmpl: '<script src="%s"></script>',
        appRoot: '.tmp/public'
      },
      files: {
        '.tmp/public/**/*.html': [ productionJSName ],
        'views/**/*.html': [ productionJSName ],
        'views/**/*.ejs': [ productionJSName ]
      }
    },

    prodJsBuild: {
      options: {
        startTag: '<!--SCRIPTS-->',
        endTag: '<!--SCRIPTS END-->',
        fileTmpl: '<script src="%s"></script>',
        appRoot: '.tmp/public',
        // relative: true
        // ^^ Uncomment this if compiling assets for use in PhoneGap, CDN, etc.
        //    (but be note that this can break custom font URLs)
      },
      files: {
        '.tmp/public/**/*.html': ['.tmp/public/dist/*.js'],
        'views/**/*.html': ['.tmp/public/dist/*.js'],
        'views/**/*.ejs': ['.tmp/public/dist/*.js']
      }
    },


    //  ╔═╗╔╦╗╦ ╦╦  ╔═╗╔═╗╦ ╦╔═╗╔═╗╔╦╗╔═╗
    //  ╚═╗ ║ ╚╦╝║  ║╣ ╚═╗╠═╣║╣ ║╣  ║ ╚═╗
    //  ╚═╝ ╩  ╩ ╩═╝╚═╝╚═╝╩ ╩╚═╝╚═╝ ╩ ╚═╝
    //  ┌─    ┬┌┐┌┌─┐┬  ┬ ┬┌┬┐┬┌┐┌┌─┐  ╔═╗╔═╗╔═╗   ┬   ┌─┐┌─┐┌┬┐┌─┐┬┬  ┌─┐┌┬┐  ╦  ╔═╗╔═╗╔═╗    ─┐
    //  │───  │││││  │  │ │ │││││││ ┬  ║  ╚═╗╚═╗  ┌┼─  │  │ ││││├─┘││  ├┤  ││  ║  ║╣ ╚═╗╚═╗  ───│
    //  └─    ┴┘└┘└─┘┴─┘└─┘─┴┘┴┘└┘└─┘  ╚═╝╚═╝╚═╝  └┘   └─┘└─┘┴ ┴┴  ┴┴─┘└─┘─┴┘  ╩═╝╚═╝╚═╝╚═╝    ─┘
    devStyles: {
      options: {
        startTag: '<!--STYLES-->',
        endTag: '<!--STYLES END-->',
        fileTmpl: '<link rel="stylesheet" href="%s">',
        appRoot: '.tmp/public'
      },

      files: {
        '.tmp/public/**/*.html': require('../pipeline').cssFilesToInject,
        'views/**/*.html': require('../pipeline').cssFilesToInject,
        'views/**/*.ejs': require('../pipeline').cssFilesToInject
      }
    },

    devStylesBuild: {
      options: {
        startTag: '<!--STYLES-->',
        endTag: '<!--STYLES END-->',
        fileTmpl: '<link rel="stylesheet" href="%s">',
        appRoot: '.tmp/public',
        // relative: true
        // ^^ Uncomment this if compiling assets for use in PhoneGap, CDN, etc.
        //    (but be note that this can break custom font URLs)
      },

      files: {
        '.tmp/public/**/*.html': require('../pipeline').cssFilesToInject,
        'views/**/*.html': require('../pipeline').cssFilesToInject,
        'views/**/*.ejs': require('../pipeline').cssFilesToInject
      }
    },

    prodStyles: {
      options: {
        startTag: '<!--STYLES-->',
        endTag: '<!--STYLES END-->',
        fileTmpl: '<link rel="stylesheet" href="%s">',
        appRoot: '.tmp/public'
      },
      files: {
        '.tmp/public/index.html': [ productionCSSName ],
        'views/**/*.html': [ productionCSSName ],
        'views/**/*.ejs': [ productionCSSName ]
      }
    },

    prodStylesBuild: {
      options: {
        startTag: '<!--STYLES-->',
        endTag: '<!--STYLES END-->',
        fileTmpl: '<link rel="stylesheet" href="%s">',
        appRoot: '.tmp/public',
        // relative: true
        // ^^ Uncomment this if compiling assets for use in PhoneGap, CDN, etc.
        //    (but be note that this can break custom font URLs)
      },
      files: {
        '.tmp/public/index.html': ['.tmp/public/dist/*.css'],
        'views/**/*.html': ['.tmp/public/dist/*.css'],
        'views/**/*.ejs': ['.tmp/public/dist/*.css']
      }
    }
  });//</ grunt.config.set() >

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // This Grunt plugin is part of the default asset pipeline in Sails,
  // so it's already been automatically loaded for you at this point.
  //
  // Of course, you can always remove this Grunt plugin altogether by
  // deleting this file.  But check this out: you can also use your
  // _own_ custom version of this Grunt plugin.
  //
  // Here's how:
  //
  // 1. Install it as a local dependency of your Sails app:
  //    ```
  //    $ npm install grunt-sails-linker --save-dev --save-exact
  //    ```
  //
  //
  // 2. Then uncomment the following code:
  //
  // ```
  // // Load Grunt plugin from the node_modules/ folder.
  // grunt.loadNpmTasks('grunt-sails-linker');
  // ```
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

};
