/*jshint node: true, strict: false */

// -------------------------- grunt -------------------------- //

module.exports = function( grunt ) {

  var banner = ( function() {
    var src = grunt.file.read('js/isotope.js');
    var re = new RegExp('^\\s*(?:\\/\\*[\\s\\S]*?\\*\\/)\\s*');
    var matches = src.match( re );
    var banner = matches[0].replace( 'Isotope', 'Isotope PACKAGED' );
    return banner;
  })();

  grunt.initConfig({
    // ----- global settings ----- //
    namespace: 'isotope',
    dataDir: 'tasks/data',

    // ----- tasks settings ----- //

    jshint: {
      docs: [ 'js/**/*.js'  ],
      options: grunt.file.readJSON('.jshintrc')
    },

    requirejs: {
      pkgd: {
        options: {
          baseUrl: 'bower_components',
          include: [
            'jquery-bridget/jquery.bridget',
            'isotope/js/isotope'
          ],
          out: 'dist/isotope.pkgd.js',
          optimize: 'none',
          paths: {
            isotope: '../',
            jquery: 'empty:'
          },
          wrap: {
            start: banner
          }
        }
      }
    },

    uglify: {
      pkgd: {
        files: {
          'dist/isotope.pkgd.min.js': [ 'dist/isotope.pkgd.js' ]
        },
        options: {
          banner: banner
        }
      }
    },

    shell: {
      'meteor-test': {
        command: 'meteor/runtests.sh'
      },
      'meteor-publish': {
        command: 'meteor/publish.sh'
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-requirejs');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask( 'pkgd-edit', function() {
    var outFile = grunt.config.get('requirejs.pkgd.options.out');
    var contents = grunt.file.read( outFile );
    // get requireJS definition code
    var definitionRE = /define\(\s*'isotope\/js\/isotope'(.|\n)+isotopeDefinition\s*\)/;
    var definition = contents.match( definitionRE )[0];
    // remove name module
    var fixDefinition = definition.replace( "'isotope/js/isotope',", '' )
      // ./item -> isotope/js/item
      .replace( /'.\//g, "'isotope/js/" );
    contents = contents.replace( definition, fixDefinition );
    grunt.file.write( outFile, contents );
    grunt.log.writeln( 'Edited ' + outFile );
  });

  grunt.registerTask('meteor-test', 'shell:meteor-test');
  grunt.registerTask('meteor-publish', 'shell:meteor-publish');
  // ideally we'd run tests before publishing, but the chances of tests breaking (given that
  // Meteor is orthogonal to the library) are so small that it's not worth the maintainer's time
  // grunt.regsterTask('meteor', ['shell:meteor-test', 'shell:meteor-publish']);
  grunt.registerTask('meteor', 'shell:meteor-publish');

  grunt.registerTask( 'default', [
    'jshint',
    'requirejs',
    'pkgd-edit',
    'uglify'
  ]);

};
