module.exports = function(grunt) {
    grunt.initConfig({
        // Tell Grunt watch module where to watch and what tasks to
        // perform upon a change.
        watch: {
            less_global: {
                files: ['Application/static/_css/**/*.less'],
                tasks: ['less:global']
            },
            javascript_global: {
                files: ['Application/static/_js/**/*.js', '!Application/static/_js/**/*.min.js'],
                tasks: ['uglify:global']
            },
            less_modules: {
                files: ['Application/modules/**/*.less'],
                tasks: ['less:modules']
            },
            javascript_modules: {
                files: ['Application/modules/**/*.js', 'Application/modules/**/*.min.js'],
                tasks: ['uglify:modules']
            },
            bower: {
                files: ['bower.json'],
                tasks: ['setup_bower']
            },
        },

        // Less will compile less files into CSS files.
        less: {
            modules: {
                options: {
                    paths: ['Application/modules/'],
                    compress: true,
                    sourceMap: true,
                },
                files: [
                    {
                        expand: true,
                        cwd: "Application/modules/",
                        src: ['**/*.less'],
                        dest: "Application/modules/",
                        ext: ".css"
                    }
                ]
            },
            global: {
                options: {
                    paths: ['Application/static/_css/'],
                    compress: true,
                    sourceMap: true,
                },
                files: [
                    {
                        expand: true,
                        cwd: "Application/static/_css/",
                        src: ['**/*.less'],
                        dest: "Application/static/_css/",
                        ext: ".min.css"
                    }
                ]
            }
        },

        // Uglify allows minification of Javascript files.
        uglify: {
            global: {
                options: {
                    paths: ['Application/static/_js/'],
                    compress: true,
                    sourceMap: true
                    // TODO Source Map.
                },
                files: [
                    {
                        expand: true,
                        cwd: "Application/static/_js/",
                        src: ['**/*.js', '!**.min.js'],
                        dest: "Application/static/_js/",
                        ext: ".min.js"
                    }
                ]
            },
            modules: {
                options: {
                    paths: ['Application/modules/'],
                    compress: true,
                    sourceMap: true
                    // TODO Source Map.
                },
                files: [
                    {
                        expand: true,
                        cwd: "Application/modules/",
                        src: ['**/*.js', '!**/*.min.js'],
                        dest: "Application/modules/",
                        ext: ".min.js"
                    }
                ]
            }
        },

        bower: {
            install: {
                options: {
                    copy: false
                }
            }
        },

        remove: {
            bower: {
                dirList: ['bower_components']
            }
        },


        copy: {
            bower_global: {
                // Setup grunt to automatically copy bower resources for our
                // global vendor folder.
                files: [
                    {expand: true, cwd: 'bower_components/bootstrap/dist/', src: ['**'], dest: 'Application/static/_vendor/bootstrap/'},
                    {expand: true, cwd: 'bower_components/bootstrap-select/dist/', src: ['**'], dest: 'Application/static/_vendor/bootstrap-select/'},
                    {expand: true, cwd: 'bower_components/jasny-bootstrap/dist/', src: ['**'], dest: 'Application/static/_vendor/jasny-bootstrap/'},
                    {expand: true, cwd: 'bower_components/jquery/dist/', src: ['**'], dest: 'Application/static/_vendor/jquery/'},
                ]
            }
        }
    })

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-remove');

    grunt.registerTask('bower_global', ['bower:install', 'copy:bower_global', 'remove:bower'])
    grunt.registerTask('default', ['copy:bower_global'])

}