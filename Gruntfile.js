'use strict';

module.exports = function(grunt) {
  var globalConfig = {
    src: 'src',
    dest: 'dist',
    sass: 'sass',
  };

  var secrets = grunt.file.readJSON('secrets.json');


  //view tasks performance times
  require('time-grunt')(grunt);

  //Load all grunt tasks listed in package.json file automatically
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    globalConfig: globalConfig,

    secrets : secrets,

    pkg: grunt.file.readJSON('package.json'),

    //Sass Config
    sass : {
      options: {
        sourceMap: true,
        relativeAssets: false,
        outputStyle: 'expanded',
        sassDir: 'src/sass',
        cssDir: 'dist/css'
      },

      build: {
        files:  {
          'dist/css/style.css' : 'src/sass/style.scss'
        }
      }
    },

    // TODO: Fixe Live reload
    //watch tasks
    watch: {
      sass: {
        files: ['<%= globalConfig.src %>/sass/**/*.{scss,sass}'],
        tasks: ['sass_globbing', 'sass'],
        options : {
          livereload : 4000
        }
      }
    },

    sass_globbing: {
     dist: {
       files: {
         '<%= globalConfig.src %>/sass/partials/_components.scss': '<%= globalConfig.src %>/sass/partials/components/**/*.scss',
         '<%= globalConfig.src %>/sass/partials/_global.scss': '<%= globalConfig.src %>/sass/partials/global/**/*.scss',
         '<%= globalConfig.src %>/sass/partials/_helper-classes.scss': '<%= globalConfig.src %>/sass/partials/helper-classes/**/*.scss'

       }
     }
   },


    shell: {
      jekyllBuild: {
        command: 'bundle exec jekyll build'
      },

      jekyllServe: {
        command: 'bundle exec jekyll serve'
      }
    },

    // Run tasks in parallel
    concurrent: {
      serve : [
        'sass_globbing',
        'sass',
        'watch',
        'shell:jekyllServe'
      ],
      options: {
        logConcurrentOutput: true
      }
    },

    litmus : {
      test: {
        src: ['<%= globalConfig.dist %>/emails/'+grunt.option('template')],
        options: {
          username: '<%= secrets.litmus.username %>', // See README for secrets.json or replace this with your username
          password: '<%= secrets.litmus.password %>', // See README for secrets.json or replace this with your password
          url: 'https://<%= secrets.litmus.company %>.litmus.com', // See README for secrets.json or replace this with your company url
          clients: ['android4', 'aolonline', 'androidgmailapp', 'aolonline', 'ffaolonline',
          'chromeaolonline', 'appmail6', 'iphone6', 'ipadmini', 'ipad', 'chromegmailnew',
          'iphone6plus', 'notes85', 'ol2002', 'ol2003', 'ol2007', 'ol2010', 'ol2011',
          'ol2013', 'outlookcom', 'chromeoutlookcom', 'chromeyahoo', 'windowsphone8'] // https://#{company}.litmus.com/emails/clients.xml
        }
      }
    },

    postcss: {
      options: {
        processors: [
          require('autoprefixer')({browser:'last 6 versions, ie9'})
        ]
      },
      dist: {
        src: 'dist/css/*.css'
      }

    },

    juice: {
      options: {
        preserveMediaQueries: true,
        applyWidthAttributes: true,
        preserveImportant: true,
        preserveFontFaces: true,
        webResources: {
        images: false
        }
      },
      dist: {
        files: [
          {
            expand : true,
            cwd: 'dist/emails/',
            src: ['**/*.html'],
            dest: 'dist/inline',
            ext: '.il.html',
            extDot: 'first'
          }
        ]
      }
    }

  });

  //Register serve task
  grunt.registerTask('serve', [
    'concurrent:serve'
  ]);

  //Register serve task
  grunt.registerTask('build', [
    'shell:jekyllBuild',
    'sass',
    'postcss',
    'juice'
  ]);

  // Register build as the default task fallback
  grunt.registerTask('default', 'build');

};
