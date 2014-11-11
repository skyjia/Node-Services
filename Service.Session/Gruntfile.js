module.exports = function (grunt) {
    // Load the plugin that provides the "jshint" task.
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Load the plugin that provides the "mochaTest" task.
    grunt.loadNpmTasks('grunt-mocha-test');

    // Load the plugin that provides the "express" task.
    //  Refer to:
    //      https://www.npmjs.org/package/grunt-express-server
    grunt.loadNpmTasks('grunt-express-server');

    grunt.loadNpmTasks('grunt-contrib-watch');

    // Project configuration.
    grunt.initConfig({
        // Configure a express task
        express: {
            options: {
                // Override defaults here
            },
            dev: {
                options: {
                    script: 'server/default.js',
                    args: ['--config','conf/development.yml' ]
                }
            }
        },

        jshint: {
            options: {
                jshintrc: true,
                reporter: require('jshint-stylish')
            },
            target1: ['Gruntfile.js', 'server/**/*.js']
        },

        watch: {
            express: {
                files:  [ 'server/**/*.js' ],
                tasks:  [ 'jshint', 'express:dev' ],
                options: {
                    // for grunt-contrib-watch v0.5.0+, "nospawn: true" for lower versions.
                    // Without this option specified express won't be reloaded
                    spawn: false
                }
            }
        },

        // Configure a mochaTest task
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    captureFile: 'test/test_results.txt', // Optionally capture the reporter output to a file
                    quiet: false // Optionally suppress output to standard out (defaults to false)
                },
                src: ['test/**/*.js']
            }
        }
    });

    // Define the default task
    grunt.registerTask('default', ['jshint','mochaTest','express:dev', 'watch']);

    // Define the test task
    grunt.registerTask('test', ['jshint','mochaTest']);

    // Define the server task
    grunt.registerTask('server', [ 'express:dev', 'watch' ]);
};
