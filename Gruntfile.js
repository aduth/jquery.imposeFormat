module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.name %> <%= pkg.version %> | (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %> | <%= pkg.license %> License */\n',
    jshint: {
      files: 'src/jquery.imposeFormat.js'
    },
    concat: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= jshint.files %>',
        dest: '<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        files: {
          '<%= pkg.name %>.min.js': '<%= jshint.files %>'
        }
      }
    },
    mocha: {
      index: ['test/index.html'],
      options: {
        run: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-jquerymanifest');

  grunt.registerTask('test', ['jshint', 'mocha']);
  grunt.registerTask('compile', ['test', 'concat', 'uglify', 'jquerymanifest']);

};
