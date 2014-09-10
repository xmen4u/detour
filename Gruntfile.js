module.exports = function(grunt) {

    // 1. All configuration goes here
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            dist: {
                src: [
                    'js/*.js' // All JS in the libs folder
                    //'public/js/global.js'  // This specific file
                ],
                dest: 'public/js/build/production.js'
            }
        },
        uglify: {
            build: {
                src: 'js/main.js',
                dest: 'public/js/build/production.min.js'
            }
        },
        imagemin: {
            dynamic: {
                files: [{
                    expand: true,
                    cache: false,
                    cwd: 'public/images/',
                    src: ['*.{png,gif}'], // adding jpg creates a bug on windows
                    //http://stackoverflow.com/questions/19906510/npm-module-grunt-contrib-imagemin-not-found-is-it-installed
                    dest: 'public/images/build/'
                }//,
                // {
                //     expand: true,
                //     cwd: 'public/stylesheets/images/',
                //     src: ['**/*.{png,jpg,gif}'],
                //     dest: 'images/build/'
                // }
                ]
            }
        },
        include_bootstrap: {
            development: {
              options: {
                sourceMap: true,
                dumpLineNumbers: 'comments',
                relativeUrls: true
              },
              files: {
                'public/css/build/styles.css': 'less/manifest.less',
              }
            },
            production: {
              options: {
                cleancss: true,
                compress: true,
                relativeUrls: true
              },
              files: {
                'public/css/build/styles.css': 'less/manifest.less',
              }
            }
        },
        watch: {
            scripts: {
                files: ['js/*.js'],
                tasks: ['concat', 'uglify'],
                options: {
                    spawn: false
                }
            }
        }
    });

    // 3. Where we tell Grunt we plan to use this plug-in.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-include-bootstrap');

    // 3.5 custom tasks
//    grunt.loadTasks('tasks').


    // multi task  - repetetive task
    //grunt.registerMultiTask

    // 4. Where we tell Grunt what to do when we type "grunt" into the terminal.
    //grunt.registerTask('default', ['concat']);
    //grunt.registerTask('default', ['concat', 'uglify']);
    grunt.registerTask('default', ['concat', 'uglify', 'imagemin','include_bootstrap'/*,'gzip'*/]);

};