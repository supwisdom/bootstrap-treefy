/*!
 * eams-ui's Gruntfile
 * Copyright 2013-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */

module.exports = function (grunt) {
  'use strict';

  // Force use of Unix newlines
  grunt.util.linefeed = '\n';

  RegExp.quote = function (string) {
    return string.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
  };

  var fs = require('fs');
  var path = require('path');

  var autoprefixerBrowsers = [
    "Android 2.3",
    "Android >= 4",
    "Chrome >= 20",
    "Firefox >= 24",
    "Explorer >= 8",
    "iOS >= 6",
    "Opera >= 12",
    "Safari >= 6"
  ];

  // Project configuration.
  grunt.initConfig({

    // Metadata.
    pkg: grunt.file.readJSON('package.json'),

    // Task configuration.
    clean: {
      dist: 'dist',
      docs: 'docs/dist'
    },

    jshint: {
      options: {
        jshintrc: 'src/js/.jshintrc'
      },
      grunt: {
        options: {
          jshintrc: 'grunt/.jshintrc'
        },
        src: ['Gruntfile.js', 'grunt/*.js']
      },
      core: {
        src: 'src/js/*.js'
      }
    },

    jscs: {
      options: {
        config: 'src/js/.jscsrc'
      },
      grunt: {
        src: '<%= jshint.grunt.src %>'
      },
      core: {
        src: '<%= jshint.core.src %>'
      }
    },

    concat: {

      js: {
        src: [
          'src/js/bootstrap-treefy.js'
        ],
        dest: 'dist/bootstrap-treefy.js'
      }
    },

    copy: {

      less: {
        expand: true,
        cwd: 'src',
        src: 'less/**/*',
        dest: 'dist/'
      },

      docs: {
        expand: true,
        cwd: 'dist/',
        src: [
          '**/*'
        ],
        dest: 'docs/dist/'
      }

    },

    uglify: {
      options: {
        preserveComments: 'some'
      },
      js: {
        src: 'dist/bootstrap-treefy.js',
        dest: 'dist/bootstrap-treefy.min.js'
      }
    },

    less: {
      compileCore: {
        options: {
          strictMath: true,
          sourceMap: true,
          outputSourceFiles: true,
          sourceMapURL: 'bootstrap-treefy.css.map',
          sourceMapFilename: 'dist/css/bootstrap-treefy.css.map'
        },
        src: 'src/less/bootstrap-treefy.less',
        dest: 'dist/css/bootstrap-treefy.css'
      }
    },

    autoprefixer: {
      options: {
        browsers: autoprefixerBrowsers
      },
      core: {
        options: {
          map: true
        },
        src: ['dist/css/bootstrap-treefy.css']
      }
    },

    htmllint: {
      options: {
        ignore: [
          'Attribute "autocomplete" not allowed on element "button" at this point.',
          'Attribute "autocomplete" not allowed on element "input" at this point.',
          'Element "img" is missing required attribute "src".'
        ]
      },
      src: '_gh_pages/**/*.html'
    },

    bootlint: {
      options: {
        stoponerror: true
      },
      files: ['_gh_pages/**/*.html']
    },

    jekyll: {
      options: {
        config: '_config.yml'
      },
      docs: {},
      github: {
        options: {
          raw: 'github: true'
        }
      }
    },

    csslint: {
      options: {
        csslintrc: 'src/less/.csslintrc'
      },
      dist: [
        'dist/css/bootstrap-treefy.css'
      ]
    },

    cssmin: {
      options: {
        compatibility: 'ie8',
        keepSpecialComments: '*',
        advanced: false
      },
      minifyCore: {
        src: 'dist/css/bootstrap-treefy.css',
        dest: 'dist/css/bootstrap-treefy.min.css'
      }
    },

    csscomb: {
      options: {
        config: 'less/.csscomb.json'
      },
      dist: {
        expand: true,
        cwd: 'dist/css/',
        src: ['*.css', '!*.min.css'],
        dest: 'dist/css/'
      }
    },

    watch: {
      src: {
        files: '<%= jshint.core.src %>',
        tasks: ['jshint:src', 'concat']
      },
      less: {
        files: 'src/less/*.less',
        tasks: 'less'
      }
    },

    exec: {
      npmUpdate: {
        command: 'npm update'
      }
    },

    compress: {
      main: {
        options: {
          archive: 'bootstrap-treefy-<%= pkg.version %>-dist.zip',
          mode: 'zip',
          level: 9,
          pretty: true
        },
        files: [
          {
            expand: true,
            cwd: 'dist/',
            src: ['**'],
            dest: 'bootstrap-treefy-<%= pkg.version %>-dist'
          }
        ]
      }
    }

  });


  // These plugins provide necessary tasks.
  require('load-grunt-tasks')(grunt, {scope: 'devDependencies'});
  require('time-grunt')(grunt);

  grunt.registerTask('less-compile', ['less']);

  grunt.registerTask('dist-js', ['concat:js', 'uglify']);
  grunt.registerTask('dist-css', ['copy:less', 'less-compile', 'autoprefixer', 'csscomb', 'cssmin']);
  grunt.registerTask('dist', ['clean:dist', 'dist-js', 'dist-css']);

  grunt.registerTask('default', ['dist']);

  grunt.registerTask('validate-html', ['jekyll:docs', 'htmllint']);
  grunt.registerTask('docs', ['clean:docs', 'copy:docs', 'jekyll:docs', 'htmllint', 'bootlint']);

  grunt.registerTask('prep-release', ['dist', 'docs', 'jekyll:github', 'compress']);

};
