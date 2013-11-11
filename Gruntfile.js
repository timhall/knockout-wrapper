module.exports = function(grunt) {
  grunt.initConfig({
    meta: {
      banner: 
        '// knockout.wrap.js - Watch observables inside of functions for knockout.js\n' +
        '// (c) Tim Hall - https://github.com/timhall/knockout.wrap - License: MIT\n' +
        '\n'
    },
    preprocess: {
      build: {
        files: {
          'knockout.wrap.js': 'src/build/knockout.wrap.js'
        }
      }
    },
    concat: {
      options: {
        banner: '<%= meta.banner %>'
      },
      build: {
        src: ['knockout.wrap.js'],
        dest: 'knockout.wrap.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= meta.banner %>'
      },
      build: {
        src: ['knockout.wrap.js'],
        dest: 'knockout.wrap.min.js'
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      src: ['src/*.js', 'specs/*.js'],
      build: ['knockout.wrap.js']
    },
    jasmine: {
      options: {
        specs: 'specs/**/*.spec.js',
        helpers: [],
        vendor: ['node_modules/knockout/build/output/knockout-latest.debug.js']
      },
      src: ['src/knockout.wrap.js']
    },
    watch: {
      files: ['src/*.js', 'specs/*.js', 'src/build/knockout.wrap.js', 'Gruntfile.js'],
      tasks: ['build', 'test'],
      interupt: true
    }
  });

  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('build', ['preprocess', 'concat', 'uglify']);
  grunt.registerTask('test', ['jshint', 'jasmine']);
  grunt.registerTask('default', ['build', 'test']);
}