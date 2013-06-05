// This is the main application configuration file

var _ = require('underscore');


module.exports = function(grunt) {
  var buildDir = 'dist'
    , website = '/website'
    , bookmarklet = '/bookmarklet'
    , iframe = '/iframe'
    , embed = '/embed'
    , chrome = '/chrome'
    , local = '/local'
    , prod = '/prod'
    , staging = '/staging'
    , firefox = '/firefox'
    , websiteLocal = buildDir + website + local
    , bookmarkletLocal = buildDir + bookmarklet + local
    , iframeLocal = buildDir + iframe + local
    , chromeLocal = buildDir + chrome + local
    , firefoxLocal = buildDir + firefox + local
    , embedLocal = buildDir + embed + local
    , hasConfigLocal = { prod: false, local: true, staging: false }
    , hasConfigProd = { prod: true, local: false, staging: false }
    , hasConfigStaging = { prod: false, local: false, staging: true }
    , hasConfigLocalChrome = _.extend({}, hasConfigLocal, { extension:true, crx: true, xpi: false })
    , hasConfigLocalFirefox = _.extend({}, hasConfigLocal, { extension:true, crx: false, xpi: true })
    , hasConfigLocalDefault = _.extend({}, hasConfigLocal, { extension:false, crx: false, xpi: false })
    , hasConfigProdChrome = _.extend({}, hasConfigProd, { extension:true, crx: true, xpi: false })
    , hasConfigProdFirefox = _.extend({}, hasConfigProd, { extension:true, crx: false, xpi: true })
    , hasConfigProdDefault = _.extend({}, hasConfigProd, { extension:false, crx: false, xpi: false })
    , hasConfigStagingChrome = _.extend({}, hasConfigStaging, { extension:true, crx: true, xpi: false })
    , hasConfigStagingFirefox = _.extend({}, hasConfigStaging, { extension:true, crx: false, xpi: true })
    , hasConfigStagingDefault = _.extend({}, hasConfigStaging, { extension:false, crx: false, xpi: false })
    ;

  // load necessary grunt plugins
  grunt.loadNpmTasks('grunt-context');
  grunt.loadNpmTasks('grunt-contrib');
  grunt.loadNpmTasks('grunt-macreload');
  grunt.loadNpmTasks('grunt-growl');
  grunt.loadTasks('grunt-tasks/tasks');


  // grunt configuration
  grunt.initConfig({


    casperjs: { website: { files: ['test/integration/website/*.test.js']
                         }
              , iframe : { files: ['test/integration/iframe/*.test.js']
                         }
              }

  , clean: { website: ['<%= dist.website %>']
           , bookmarklet: ['<%= dist.bookmarklet %>']
           , iframe: ['<%= dist.iframe %>']
           , chrome: ['<%= dist.chrome %>']
           , firefox: ['<%= dist.firefox %>']
           }

  , compress: { chrome: { files: { '<%= dist.chrome %>/chrome.zip': '<%= dist.chrome %>/**' }
                        , options: { mode: 'zip' }
                        }
              }

    // environment specific configuration
    // all the properties here will override the default properties
    // when run in the appropriate context
    // https://github.com/indieisaconcept/grunt-context/
  , context: { local: { options: { requirejs: { website: { options: { has: hasConfigLocalDefault  } }
                                              , bookmarklet: { options: {has: hasConfigLocalDefault } }
                                              , iframe: { options: { has: hasConfigLocalDefault } }
                                              , embed: { options: { has: hasConfigLocalDefault } }
                                              , chrome_inject_embed_outer: { options: { has: hasConfigLocalChrome } }
                                              , chrome_inject_embed_inner: { options: { has: hasConfigLocalChrome } }
                                              , chrome_overlay_outer: { options: { has: hasConfigLocalChrome } }
                                              , chrome_overlay_inner: { options: { has: hasConfigLocalChrome } }
                                              , chrome_popover_outer: { options: { has: hasConfigLocalChrome } }
                                              , chrome_popover_inner: { options: { has: hasConfigLocalChrome } }
                                              , chrome_background_script: { options: { has: hasConfigLocalChrome } }
                                              , chrome_settings: { options: { has: hasConfigLocalChrome } }
                                              , firefox_popover_outer: { options: { has: hasConfigLocalFirefox , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                              , firefox_popover_inner: { options: { has: hasConfigLocalFirefox , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                              , firefox_overlay_outer: { options: { has: hasConfigLocalFirefox , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                              , firefox_overlay_inner: { options: { has: hasConfigLocalFirefox , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                              , firefox_inject_embed_outer: { options: { has: hasConfigLocalFirefox , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                              , firefox_inject_embed_inner: { options: { has: hasConfigLocalFirefox , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                              }
                                 , uglify: { mangle: { defines: { DEVMODE: ['name', 'true'] } } }
                                 }
                      , tasks: { 'website': 'websiteAll'
                               , 'bookmarklet': 'bookmarkletAll'
                               , 'iframe': 'iframeAll'
                               , 'chrome': 'chromeAll'
                               , 'firefox': 'firefoxAll'
                               , 'embed': 'embedAll'
                               }
                      }
           , dev: { options: { requirejs: { website: { options: { has: hasConfigLocalDefault , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                          , bookmarklet: { options: { has: hasConfigLocalDefault  , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                          , iframe: { options: { has: hasConfigLocalDefault , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                          , embed: { options: { has: hasConfigLocalDefault, paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                          , chrome_popover_inner: { options: { has: hasConfigLocalChrome , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                          , chrome_popover_outer: { options: { has:  hasConfigLocalChrome, paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                          , chrome_inject_embed_outer: { options: { has: hasConfigLocalChrome, paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                          , chrome_overlay_outer: { options: { has: hasConfigLocalChrome , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                          , chrome_background_script: { options: { has: hasConfigLocalChrome , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                          , chrome_overlay_inner: { options: { has: hasConfigLocalChrome , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                          , chrome_settings: { options: { has: hasConfigLocalChrome , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                          , chrome_inject_embed_inner: { options: { has: hasConfigLocalChrome , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                          , chrome_preview_popover_outer: { options: { has: hasConfigLocalChrome , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                          , firefox_popover_outer: { options: { has: hasConfigLocalFirefox , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                          , firefox_popover_inner: { options: { has: hasConfigLocalFirefox , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                          , firefox_overlay_outer: { options: { has: hasConfigLocalFirefox , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                          , firefox_overlay_inner: { options: { has: hasConfigLocalFirefox , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                          , firefox_inject_embed_outer: { options: { has: hasConfigLocalFirefox , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                          , firefox_inject_embed_inner: { options: { has: hasConfigLocalFirefox , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                          , firefox_preview_popover_outer: { options: { has: hasConfigLocalFirefox , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                          }
                             }
                  , tasks: { 'website': 'lint:lib lint:website lint:shared requirejs:website stylus:website'
                           , 'bookmarklet': 'lint:bookmarklet lint:shared requirejs:bookmarklet stylus:bookmarklet'
                           , 'iframe': 'lint:iframe lint:shared requirejs:iframe stylus:iframe concat:iframe'
                           , 'chrome': 'lint:lib lint:chrome lint:iframe lint:shared requirejsChromeScripts stylus:chrome copy:chrome concatChrome'
                           , 'firefox': 'lint:lib lint:firefox lint:iframe lint:shared requirejsFirefoxScripts copy:firefox copy:firefox_deps copy:firefox_env stylus:firefox concatFirefox'
                           , 'embed': 'lint:embed lint:shared requirejs:embed stylus:embed'
                           }
                  }
           , prod: { options: {requirejs: { website: { options: { has: hasConfigProdDefault } }
                                             , bookmarklet: { options: { has:hasConfigProdDefault } }
                                             , iframe: { options: { has: hasConfigProdDefault } }
                                             , embed: { options: { has: hasConfigProdDefault } }
                                             , chrome_overlay_inner: { options: { has: hasConfigProdChrome} }
                                             , chrome_overlay_outer: { options: { has: hasConfigProdChrome} }
                                             , chrome_popover_inner: { options: { has: hasConfigProdChrome} }
                                             , chrome_popover_outer: { options: { has: hasConfigProdChrome} }
                                             , chrome_inject_embed_inner: { options: { has: hasConfigProdChrome} }
                                             , chrome_inject_embed_outer: { options: { has: hasConfigProdChrome} }
                                             , chrome_settings: { options: { has: hasConfigProdChrome } }
                                             , chrome_background_script: { options: { has: hasConfigProdChrome } }
                                             , chrome_preview_popover_outer: { options: { has: hasConfigProdChrome  } }
                                             , firefox_popover_outer: { options: { has: hasConfigProdFirefox , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                             , firefox_popover_inner: { options: { has: hasConfigProdFirefox , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' }} }
                                             , firefox_overlay_outer: { options: { has: hasConfigProdFirefox , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' }} }
                                             , firefox_overlay_inner: { options: { has: hasConfigProdFirefox , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' }} }
                                             , firefox_inject_embed_outer: { options: { has: hasConfigProdFirefox , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' }} }
                                             , firefox_inject_embed_inner: { options: { has: hasConfigProdFirefox , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' }} }
                                             , firefox_preview_popover_outer: { options: { has: hasConfigProdFirefox , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' }} }
                                             }
                                , copy: { firefox_env: { files: [ {dest:'<%= dist.firefox %>/xpi/lib', src:'src/app/lib/environment-prod.js' }]} }
                                }

                      , tasks: { 'website': 'websiteAll'
                               , 'bookmarklet': 'bookmarkletAll'
                               , 'iframe': 'iframeAll'
                               , 'chrome': 'chromeAll'
                               , 'embed': 'embedAll'
                               , 'firefox': 'firefoxAll'
                               }
                      }

           , staging: { options: {requirejs: { website: { options: { has: hasConfigStagingDefault , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                             , bookmarklet: { options: { has: hasConfigStagingDefault , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                             , iframe: { options: { has: hasConfigStagingDefault , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                             , embed: { options: { has: hasConfigStagingDefault , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                             , chrome_background_script: { options: { has: hasConfigStagingChrome, paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                             , chrome_settings: { options: { has: hasConfigStagingDefault, paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                             , chrome_popover_outer: { options: { has: hasConfigStagingDefault, paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                             , chrome_popover_inner: { options: { has: hasConfigStagingDefault, paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                             , chrome_overlay_inner: { options: { has: hasConfigStagingDefault , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' }} }
                                             , chrome_overlay_outer: { options: { has: hasConfigStagingDefault, paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                             , chrome_inject_embed_outer: { options: { has: hasConfigStagingDefault, paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                             , chrome_inject_embed_inner: { options: { has: hasConfigStagingDefault , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' }} }
                                             , chrome_preview_popover_outer: { options: { has: hasConfigStagingDefault , paths: { devmodeRetroCompatibility: 'src/app/lib/devmodeRetroCompatibility' } } }
                                             , firefox_popover_outer: { options: { has: hasConfigStagingFirefox  } }
                                             , firefox_popover_inner: { options: { has: hasConfigStagingFirefox  } }
                                             , firefox_overlay_outer: { options: { has: hasConfigStagingFirefox  } }
                                             , firefox_overlay_inner: { options: { has: hasConfigStagingFirefox  } }
                                             , firefox_inject_embed_outer: { options: { has: hasConfigStagingFirefox } }
                                             , firefox_inject_embed_inner: { options: { has: hasConfigStagingFirefox , out: '<%= dist.firefox %>/public/src/inject-embed.too.js'} }
                                             , firefox_preview_popover_outer: { options: { has: hasConfigStagingFirefox , out: '<%= dist.firefox %>/public/src/inject-embed.too.js'} }
                                             }
                                 , uglify: { mangle: { defines: { DEVMODE: ['name', 'true'] } } }
                                 , copy: { firefox_env: { files: [ {dest:'<%= dist.firefox %>/xpi/lib', src:'src/app/lib/environment-staging.js' }]} }
                                 }
                      , tasks: { 'website': 'websiteStaging'
                               , 'bookmarklet': 'bookmarkletStaging'
                               , 'iframe': 'iframeStaging'
                               , 'chrome': 'chromeStaging'
                               , 'embed': 'embedAll'
                               , 'firefox': 'firefoxAll'
                               }
          }
    }

    // copy static assets and files to dist directories
    // typically images, css, html files, etc.
    // https://github.com/gruntjs/grunt-contrib/blob/master/docs/copy.md
  , copy: { website: { files: { '<%= dist.website %>/assets/img': ['assets/img/**/*.ico', 'assets/img/**/*.png', 'assets/img/**/*.jpg', 'assets/img/**/*.gif']
                              , '<%= dist.website %>/assets/css': ['assets/css/bootstrap/*','assets/css/select2/*', 'assets/css/social-icons/*', 'assets/css/FortAwesome-Font-Awesome-13d5dd3/**']
                              }
                     , options: { flatten: true }
                     }
          , bookmarklet: { files: { '<%= dist.bookmarklet %>/assets/img/': ['assets/img/**/*.png', 'assets/img/**/*.jpg', 'assets/img/**/*.gif'] }
                      }
          , iframe: { files: { '<%= dist.iframe %>/assets/img': ['assets/img/**/*.png', 'assets/img/**/*.jpg', 'assets/img/**/*.gif']
                             , '<%= dist.iframe %>/assets/css': ['assets/css/bootstrap/bootstrap.*', 'assets/css/social-icons/*']
                             }
                     , options: { flatten: true }
                    }
          , iframebis: { files: { '<%= dist.iframe %>/': ['src/templates/static/iframe/*']  }
                       , options: { flatten: true } // this is to get iframe.html at the root of dist/iframe/local/
                       }
          , chrome: { files: { '<%= dist.chrome %>/assets/img': ['assets/img/**/*.png', 'assets/img/**/*.jpg', 'assets/img/**/*.gif']
                             , '<%= dist.chrome %>/assets/css': ['assets/css/bootstrap/*', 'assets/css/social-icons/*']
                             , '<%= dist.chrome %>': ['assets/chrome/*', 'src/templates/static/chrome/*']
                             , '<%= dist.chrome %>/src': ['src/app/main/chrome/firstInstall.js']
                             , '<%= dist.iframe %>': ['src/templates/static/iframe/*']
                             }
                     , options: { flatten: true }
                  }
          , firefox: { files: { '<%= dist.firefox %>/public/assets/img': ['assets/img/**/*.png', 'assets/img/**/*.jpg', 'assets/img/**/*.gif']
                              , '<%= dist.firefox %>/public/assets/css': ['assets/css/bootstrap/*', 'assets/css/social-icons/*']
                              , '<%= dist.firefox %>/xpi': ['assets/firefox/*', 'assets/img/icon.png']
                              , '<%= dist.firefox %>/xpi/lib': ['src/app/main/firefox/main.js','src/app/lib/blackList.js']
                              , '<%= dist.firefox %>/xpi/data/assets/img': ['assets/img/**/*.png', 'assets/img/**/*.jpg', 'assets/img/**/*.gif']
                              , '<%= dist.firefox %>/public': ['src/templates/static/iframe/*']
                              }
                     , options: { flatten: true }
                  }
          , firefox_deps: { files: { '<%= dist.firefox %>/xpi/packages/moz-urlbarbutton-master': ['src/vendor/moz-urlbarbutton-master/**']
                                   , '<%= dist.firefox %>/xpi/packages/moz-showforpage-master': ['src/vendor/moz-showforpage-master/**']
                                   }
                  }
          , firefox_env: { files: [ {dest:'<%= dist.firefox %>/xpi/lib', src:'src/app/lib/environment-local.js' }]
                         , options: { processName: function(filename) {
                                                     return 'environment.js';
                                                   }
                                    }
                         }
          }

  , concat: { iframe: { src: [ '<%= dist.iframe %>/assets/css/bootstrap.min.css', '<%= dist.iframe %>/assets/css/iframe.css']
                     , dest:  '<%= dist.iframe %>/assets/css/iframe.css'
                     }
            , chrome_overlay: { src: [ '<%= dist.chrome %>/assets/css/bootstrap.min.css', '<%= dist.chrome %>/assets/css/overlay.inner.css']
                     , dest:  '<%= dist.chrome %>/assets/css/overlay.inner.css'
                     }
            , chrome_inject_embed_inner: { src: [ '<%= dist.chrome %>/assets/css/bootstrap.min.css', '<%= dist.chrome %>/assets/css/inject-embed.inner.css']
                     , dest:  '<%= dist.chrome %>/assets/css/inject-embed.inner.css'
                     }
            , chrome_popover: { src: [ '<%= dist.chrome %>/assets/css/bootstrap.min.css', '<%= dist.chrome %>/assets/css/popover.inner.css']
                     , dest:  '<%= dist.chrome %>/assets/css/popover.inner.css'
                     }
            , firefox_popover: { src: [ '<%= dist.firefox %>/public/assets/css/bootstrap.min.css', '<%= dist.firefox %>/public/assets/css/popover.inner.css']
                     , dest:  '<%= dist.firefox %>/public/assets/css/popover.inner.css'
                     }
            , firefox_overlay: { src: [ '<%= dist.firefox %>/public/assets/css/bootstrap.min.css', '<%= dist.firefox %>/public/assets/css/overlay.inner.css']
                     , dest:  '<%= dist.firefox %>/public/assets/css/overlay.inner.css'
                     }
            , firefox_embed: { src: [ '<%= dist.firefox %>/public/assets/css/bootstrap.min.css', '<%= dist.firefox %>/public/assets/css/inject-embed.inner.css']
                     , dest:  '<%= dist.firefox %>/public/assets/css/inject-embed.inner.css'
                     }
  }


    // helper object to access dist directories inside the config object
  , dist: { website: websiteLocal
          , bookmarklet: bookmarkletLocal
          , iframe: iframeLocal
          , embed: embedLocal
          , chrome: chromeLocal
          , firefox: firefoxLocal
          }

  // Growl notifications
  , growl : {
            success : {
                message : 'This is a success captain',
                title : 'Build'
            }
        }

    // JSHint configuration
    // see here for explanation: http://www.jshint.com/options/
  , jshint: {
      options: { browser: true
               , curly: true
               , devel: true
               , debug: true
               , eqeqeq: true
               , expr: true
               , forin: true
               , immed: true
               //, latedef: true
               , laxcomma: true
               , newcap: true
               , noarg: true
               , trailing: true
               , undef: true
               }
    , globals: { // needed for requireJS
                 define: true
               , require: true
               , requirejs: true
               , has: true
               , module: true
               // needed for 3rd party integration
               , FB: true
               , twttr: true
               // needed for testing
               , casper: true
               , mocha: true
               , it: true
               , describe: true
               , beforeEach: true
               // needed for accessing env variables in gruntfile
               , process: true
               // needed for removing console.logs in production
               , DEVMODE: true
               // needed for using mixpanel
               , mixpanel: true
               // needed to use the chrome extension APIs
               , chrome: true
               , jQuery: true
               // Used in firefox content scripts
               , self: true
               , unsafeWindow: true
               , exports: true
               }
    }

    // The lint task will run JSHint and report any errors
    // You can change the options for this task, by reading this:
    // https://github.com/cowboy/grunt/blob/master/docs/task_lint.md
  , lint: { website: ['src/app/**/website/*.js']
          , bookmarklet: ['src/app/**/bookmarklet/*.js']
          , iframe: ['src/app/**/iframe/*.js']
          , chrome: ['src/app/**/chrome/*.js']
          , embed: ['src/app/**/embed/*.js']
          , shared: ['src/app/**/shared/*.js']
          , firefox: ['src/app/**/firefox/*.js']
          , lib: ['src/app/lib/*.js']
          , grunt: ['grunt.js', 'grunt-tasks/*.js']
          , test: ['test/**/*.js']
          }

    // minify with uglifyjs
  , min: { website: { src: ['<%= dist.website %>/src/website.js'] , dest: '<%= dist.website %>/src/website.js' }
         , bookmarklet: { src: ['<%= dist.bookmarklet %>/src/bookmarklet.js'] , dest: '<%= dist.bookmarklet %>/src/bookmarklet.js' }
         , iframe: { src: ['<%= dist.iframe %>/src/iframe.js'] , dest: '<%= dist.iframe %>/src/iframe.js' }
         , embed: { src: ['<%= dist.embed %>/widget-embed.js'] , dest: '<%= dist.embed %>/widget-embed.js' }
         , chrome_popover_outer: { src: ['<%= dist.chrome %>/src/popover.outer.js'] , dest: '<%= dist.chrome %>/src/popover.outer.js' }
         , chrome_inject_embed_outer: { src: ['<%= dist.chrome %>/src/inject-embed.outer.js'] , dest: '<%= dist.chrome %>/src/inject-embed.outer.js' }
         , chrome_overlay_outer: { src: ['<%= dist.chrome %>/src/overlay.outer.js'] , dest: '<%= dist.chrome %>/src/overlay.outer.js' }
         , chrome_popover_inner: { src: ['<%= dist.chrome %>/src/popover.inner.js'] , dest: '<%= dist.chrome %>/src/popover.inner.js' }
         , chrome_background_script: { src: ['<%= dist.chrome %>/src/background.js'] , dest: '<%= dist.chrome %>/src/background.js' }
         , chrome_overlay_inner: { src: ['<%= dist.chrome %>/src/overlay.inner.js'] , dest: '<%= dist.chrome %>/src/overlay.inner.js' }
         , chrome_settings: { src: ['<%= dist.chrome %>/src/settings.js'] , dest: '<%= dist.chrome %>/src/settings.js' }
         , chrome_inject_embed_inner: { src: ['<%= dist.chrome %>/src/inject-embed.inner.js'] , dest: '<%= dist.chrome %>/src/inject-embed.inner.js' }
         , chrome_preview_popover_outer: { src: ['<%= dist.chrome %>/src/preview-popover.outer.js'] , dest: '<%= dist.chrome %>/src/preview-popover.outer.js' }
         , firefox_preview_popover_outer: { src: [ '<%= dist.firefox %>/xpi/data/src/preview-popover.outer.js'] , dest:  '<%= dist.firefox %>/xpi/data/src/preview-popover.outer.js'}
         , firefox_popover_outer: { src: [ '<%= dist.firefox %>/xpi/data/src/popover.outer.js'] , dest:  '<%= dist.firefox %>/xpi/data/src/popover.outer.js'}
         , firefox_popover_inner: { src: [ '<%= dist.firefox %>/public/src/popover.inner.js'] , dest:  '<%= dist.firefox %>/public/src/popover.inner.js'}
         , firefox_overlay_outer: { src: [ '<%= dist.firefox %>/xpi/data/src/overlay.outer.js'] , dest:  '<%= dist.firefox %>/xpi/data/src/overlay.outer.js'}
         , firefox_overlay_inner: { src: [ '<%= dist.firefox %>/public/src/overlay.inner.js'] , dest:  '<%= dist.firefox %>/public/src/overlay.inner.js'}
         , firefox_inject_embed_outer: { src: [ '<%= dist.firefox %>/xpi/data/src/inject-embed.outer.js'] , dest:  '<%= dist.firefox %>/xpi/data/src/inject-embed.outer.js'}
         , firefox_inject_embed_inner: { src: [ '<%= dist.firefox %>/public/src/inject-embed.inner.js'] , dest:  '<%= dist.firefox %>/public/src/inject-embed.inner.js'}
         }

    // requireJS config
    // https://github.com/gruntjs/grunt-contrib
    // pretty much the same as with requireJS without grunt
  , requirejs: { website: { options: { mainConfigFile: 'src/config.requirejs.js'
                                     , include: ['main/website/website']
                                     , out: '<%= dist.website %>/src/website.js'
                                     }
                           }
               , bookmarklet: { options: { namespace: 'tldr3p'
                                         , include: ['main/bookmarklet/bookmarklet']
                                         , mainConfigFile: 'src/config.requirejs.js'
                                         , out: '<%= dist.bookmarklet %>/src/bookmarklet.js'
                                         }
                           }
               , iframe: { options: { namespace: 'tldr3p'
                                    , include: ['main/iframe/iframe']
                                    , mainConfigFile: 'src/config.requirejs.js'
                                    , out: '<%= dist.iframe %>/src/iframe.js'
                                    }
                           }
               , embed: { options: { namespace: 'tldr3p'
                                    , include: ['main/embed/widget-embed']
                                    , mainConfigFile: 'src/config.requirejs.js'
                                    , out: '<%= dist.embed %>/widget-embed.js'
                                    }
                           }
               , chrome_inject_embed_inner: { options: { include: ['main/chrome/inject-embed.inner']
                                                , mainConfigFile: 'src/config.requirejs.js'
                                                , out: '<%= dist.chrome %>/src/inject-embed.inner.js'
                                                }
                                        }
               , chrome_inject_embed_outer: { options: { include: ['main/chrome/inject-embed.outer']
                                                   , mainConfigFile: 'src/config.requirejs.js'
                                                   , out: '<%= dist.chrome %>/src/inject-embed.outer.js'
                                                   }
                                        }
               , chrome_overlay_inner: { options: { include: ['main/chrome/overlay.inner']
                                                , mainConfigFile: 'src/config.requirejs.js'
                                                , out: '<%= dist.chrome %>/src/overlay.inner.js'
                                                }
                                        }
               , chrome_overlay_outer: { options: { include: ['main/chrome/overlay.outer']
                                                   , mainConfigFile: 'src/config.requirejs.js'
                                                   , out: '<%= dist.chrome %>/src/overlay.outer.js'
                                                   }
                                        }
               , chrome_popover_inner: { options: { include: ['main/extensions/popover.inner']
                                                   , mainConfigFile: 'src/config.requirejs.js'
                                                   , out: '<%= dist.chrome %>/src/popover.inner.js'
                                                   }
                                        }
               , chrome_popover_outer: { options: { include: ['main/chrome/popover.outer']
                                                   , mainConfigFile: 'src/config.requirejs.js'
                                                   , out: '<%= dist.chrome %>/src/popover.outer.js'
                                                   }
                                        }
               , chrome_background_script: { options: { include: ['main/chrome/background']
                                                   , mainConfigFile: 'src/config.requirejs.js'
                                                   , out: '<%= dist.chrome %>/src/background.js'
                                                   }
                                        }
               , chrome_settings: { options: {  include: ['main/chrome/settings']
                                                   , mainConfigFile: 'src/config.requirejs.js'
                                                   , out: '<%= dist.chrome %>/src/settings.js'
                                                   }
                                        }
               , chrome_preview_popover_outer: { options: { include: ['main/chrome/preview-popover.outer']
                                                , mainConfigFile: 'src/config.requirejs.js'
                                                , out: '<%= dist.chrome %>/src/preview-popover.outer.js'
                                                }
                                        }
               , firefox_preview_popover_outer: { options: { include: ['main/firefox/preview-popover.outer']
                                                   , mainConfigFile: 'src/config.requirejs.js'
                                                   , out: '<%= dist.firefox %>/xpi/data/src/preview-popover.outer.js'
                                                   }
                                        }
               , firefox_popover_outer: { options: { include: ['main/firefox/popover.outer']
                                                   , mainConfigFile: 'src/config.requirejs.js'
                                                   , out: '<%= dist.firefox %>/xpi/data/src/popover.outer.js'
                                                   }
                                        }
               , firefox_popover_inner: { options: { include: ['main/extensions/popover.inner']
                                                   , mainConfigFile: 'src/config.requirejs.js'
                                                   , out: '<%= dist.firefox %>/public/src/popover.inner.js'
                                                   }
                                        }
               , firefox_overlay_outer: { options: { include: ['main/firefox/overlay.outer']
                                                   , mainConfigFile: 'src/config.requirejs.js'
                                                   , out: '<%= dist.firefox %>/xpi/data/src/overlay.outer.js'
                                                   }
                                        }
               , firefox_overlay_inner: { options: { include: ['main/firefox/overlay.inner']
                                                   , mainConfigFile: 'src/config.requirejs.js'
                                                   , out: '<%= dist.firefox %>/public/src/overlay.inner.js'
                                                   }
                                        }
               , firefox_inject_embed_outer: { options: { include: ['main/firefox/inject-embed.outer']
                                                   , mainConfigFile: 'src/config.requirejs.js'
                                                   , out: '<%= dist.firefox %>/xpi/data/src/inject-embed.outer.js'
                                                   }
                                        }
               , firefox_inject_embed_inner: { options: { include: ['main/firefox/inject-embed.inner']
                                                   , mainConfigFile: 'src/config.requirejs.js'
                                                   , out: '<%= dist.firefox %>/public/src/inject-embed.inner.js'
                                                   }
                                        }

               }

    // compiles stylus files into css
    // https://github.com/gruntjs/grunt-contrib/blob/master/docs/stylus.md
  , stylus: { website: { files: { '<%= dist.website %>/assets/css/website.css': [ 'src/styl/website/*'
                                                                                , 'src/styl/shared/powertip.without.iframe.styl'
                                                                                , 'src/styl/shared/badges.styl'
                                                                                , 'src/styl/shared/animations.styl'
                                                                                , 'src/styl/shared/main.styl'
                                                                                , 'src/styl/shared/tldr.read.styl'
                                                                                , 'src/styl/shared/install-bm.styl'
                                                                                , 'src/styl/shared/sharing.styl'
                                                                                , 'src/styl/shared/thank.styl'
                                                                                , 'src/styl/shared/screenshot-chrome.styl'
                                                                                ] } }
            , embed: { files: { '<%= dist.embed %>/assets/css/widget.embed.outer.css': ['src/styl/embed/widget.embed.outer.styl']
                              , '<%= dist.embed %>/assets/css/widget.embed.inner.css': [ 'src/styl/embed/widget.embed.inner.styl']
                              } }
            , bookmarklet: { files: { '<%= dist.bookmarklet %>/assets/css/bookmarklet.css': ['src/styl/bookmarklet/bookmarklet.styl'] } }
            , iframe: { files: { '<%= dist.iframe %>/assets/css/iframe.css': [ 'src/styl/iframe/iframe.styl'
                                                                             , 'src/styl/iframe/guidelines.styl'
                                                                             , 'src/styl/shared/tldr.read.styl'
                                                                             , 'src/styl/shared/sharing.styl'
                                                                             , 'src/styl/shared/congrats.styl'
                                                                             , 'src/styl/shared/thank.styl'
                                                                            // this last one shouldn't be necessary, commenting out for testing
                                                                             //, 'src/styl/shared/jquery.powertip.styl'
                                                                             ] } }
            , chrome: { files: { '<%= dist.chrome %>/assets/css/popover.outer.css': [ 'src/styl/shared/powertip.with.iframe.styl'
                                                                             , 'src/styl/shared/tldr.read.styl'
                                                                             , 'src/styl/shared/badges.styl'
                                                                             , 'src/styl/shared/preview-popover.outer.styl'
                                                                             ]
                               , '<%= dist.chrome %>/assets/css/settings.css': ['src/styl/chrome/settings.styl']
                               , '<%= dist.chrome %>/assets/css/overlay.inner.css': [ 'src/styl/chrome/overlay.inner.styl'
                                                                                 , 'src/styl/iframe/iframe.styl'
                                                                                 , 'src/styl/iframe/guidelines.styl'
                                                                                 , 'src/styl/shared/tldr.read.styl'
                                                                                 , 'src/styl/shared/sharing.styl'
                                                                                 , 'src/styl/shared/congrats.styl'
                                                                                 , 'src/styl/shared/thank.styl'
                                                                                 ]
                               , '<%= dist.chrome %>/assets/css/popover.inner.css': [ 'src/styl/chrome/popover.inner.styl'
                                                                                     , 'src/styl/iframe/iframe.styl'
                                                                                     , 'src/styl/iframe/guidelines.styl'
                                                                                     , 'src/styl/shared/tldr.read.styl'
                                                                                     , 'src/styl/shared/sharing.styl'
                                                                                     , 'src/styl/shared/thank.styl'
                                                                                     , 'src/styl/shared/preview-popover.inner.styl'
                                                                                     , 'src/styl/shared/payorwork.styl'
                                                                                     ]
                               , '<%= dist.chrome %>/assets/css/inject-embed.inner.css': [ 'src/styl/chrome/inject-embed.inner.styl'
                                                                                   ]
                               , '<%= dist.chrome %>/assets/css/inject-embed.outer.css': ['src/styl/chrome/inject-embed.outer.styl']
                               , '<%= dist.chrome %>/assets/css/overlay.outer.css': [ 'src/styl/bookmarklet/bookmarklet.styl'
                                                                              , 'src/styl/shared/screenshot-chrome.styl'
                                                                              , 'src/styl/chrome/firstContrib.styl' ] } }
            , firefox: { files: { '<%= dist.firefox %>/public/assets/css/popover.outer.css': [ 'src/styl/shared/powertip.with.iframe.styl'
                                                                                               , 'src/styl/shared/badges.styl'
                                                                                               , 'src/styl/shared/preview-popover.outer.styl'
                                                                                        ]
                                , '<%= dist.firefox %>/public/assets/css/overlay.outer.css': [ 'src/styl/bookmarklet/bookmarklet.styl' ]
                                , '<%= dist.firefox %>/public/assets/css/popover.inner.css': [ 'src/styl/chrome/popover.inner.styl'
                                                                                              , 'src/styl/iframe/iframe.styl'
                                                                                              , 'src/styl/iframe/guidelines.styl'
                                                                                              , 'src/styl/shared/tldr.read.styl'
                                                                                              , 'src/styl/shared/sharing.styl'
                                                                                              , 'src/styl/shared/thank.styl'
                                                                                              , 'src/styl/shared/preview-popover.inner.styl'
                                                                                              ]
                                , '<%= dist.firefox %>/public/assets/css/overlay.inner.css': [ 'src/styl/chrome/overlay.inner.styl'
                                                                                 , 'src/styl/iframe/iframe.styl'
                                                                                 , 'src/styl/iframe/guidelines.styl'
                                                                                 , 'src/styl/shared/tldr.read.styl'
                                                                                 , 'src/styl/shared/sharing.styl'
                                                                                 , 'src/styl/shared/congrats.styl'
                                                                                 , 'src/styl/shared/loginForm.styl'
                                                                                 , 'src/styl/shared/thank.styl'
                                                                                 ]
                               , '<%= dist.firefox %>/public/assets/css/inject-embed.outer.css': ['src/styl/chrome/inject-embed.outer.styl']
                               , '<%= dist.firefox %>/public/assets/css/inject-embed.inner.css': [ 'src/styl/chrome/inject-embed.inner.styl' ]
                                }
                        }
            }

    // options can be specified in the uglify property,
    // see https://github.com/cowboy/grunt/blob/master/docs/task_min.md#specifying-uglifyjs-options
    // and https://github.com/mishoo/UglifyJS/#api
  , uglify: { mangle: { toplevel: true
                      , except: ['tldr3p', 'tldr']
                      , defines: { DEVMODE: ['name', 'false'] }
                      }
            }

    // watch task to help during development
  , watch: { stylus: { files: ['src/styl/**/*']
                     , tasks: ['stylus']
                     }
           , website: { files: [ '<config:lint.website>'
                               , '<config:lint.shared>'
                               , '<config:lint.lib>'
                               , 'src/templates/website/**/*'
                               , 'src/templates/shared/**/*'
                               , 'src/styl/**/*'
                               ]
                      , tasks: ['wdev']
                      }
           , bookmarklet: { files: [ '<config:lint.bookmarklet>'
                                   , '<config:lint.shared>'
                                   , '<config:lint.lib>'
                                   , 'src/templates/bookmarklet/**/*'
                                   , 'src/templates/shared/**/*'
                                   , 'src/styl/**/*'
                                   ]
                          , tasks: ['bdev']
                          }
           , embed: { files: [ '<config:lint.embed>'
                             , '<config:lint.shared>'
                             , 'src/styl/**/*'
                             ]
                      , tasks: ['edev']
                      }
           , iframe: { files: [ '<config:lint.iframe>'
                              , '<config:lint.shared>'
                              , '<config:lint.lib>'
                              , 'src/templates/iframe/**/*'
                              , 'src/templates/shared/**/*'
                              , 'src/styl/**/*'
                              ]
                      , tasks: ['idev']
                      }
           , staticIframe: { files: ['src/templates/static/iframe/**/*']
                           , tasks: ['copy:iframe']
                           }
           , chrome: { files: [ '<config:lint.chrome>'
                            , '<config:lint.shared>'
                            , '<config:lint.iframe>'
                            , '<config:lint.lib>'
                            , 'assets/css/jquery.powertip/jquery.powertip.css'
                            , 'assets/chrome/*'
                            , 'src/templates/shared/**/*'
                            , 'src/styl/**/*'
                            , 'src/vendor/jquery.powertip-1.1.0/jquery.powertip.js'
                            , 'src/templates/**/*'
                            ]
                      , tasks: ['cdev']
                      }
           , firefox: { files: [ '<config:lint.firefox>'
                            , '<config:lint.chrome>'
                            , '<config:lint.shared>'
                            , '<config:lint.iframe>'
                            , '<config:lint.lib>'
                            , 'src/templates/shared/**/*'
                            , 'src/styl/**/*'
                            , 'src/templates/**/*'
                            ]
                      , tasks: ['fdev']
                      }
           }
  });

  // register aliases
  // default task
  grunt.registerTask('default', 'watch:staticWebsite');

  // website tasks
  grunt.registerTask('wlocal', 'context:local:website');
  grunt.registerTask('wdev', 'context:dev:website growl:success');
  grunt.registerTask('wprod', 'context:prod:website');
  grunt.registerTask('wstaging', 'context:staging:website');

  // bookmarklet tasks
  grunt.registerTask('blocal', 'context:local:bookmarklet');
  grunt.registerTask('bdev', 'context:dev:bookmarklet growl:success');
  grunt.registerTask('bprod', 'context:prod:bookmarklet');
  grunt.registerTask('bstaging', 'context:staging:bookmarklet');

  // iframe tasks
  grunt.registerTask('ilocal', 'context:local:iframe');
  grunt.registerTask('idev', 'context:dev:iframe growl:success');
  grunt.registerTask('iprod', 'context:prod:iframe');
  grunt.registerTask('istaging', 'context:staging:iframe');

  // chrome tasks
  grunt.registerTask('clocal', 'context:local:chrome');
  grunt.registerTask('cdev', 'context:dev:chrome growl:success');
  grunt.registerTask('cprod', 'context:prod:chrome');
  grunt.registerTask('cstaging', 'context:staging:chrome');

  grunt.registerTask('concatChrome', 'concat:chrome_popover concat:chrome_inject_embed_inner concat:chrome_overlay');
  grunt.registerTask('requirejsChromeScripts', 'requirejs:chrome_popover_outer requirejs:chrome_inject_embed_outer requirejs:chrome_overlay_outer requirejs:chrome_popover_inner requirejs:chrome_background_script  requirejs:chrome_overlay_inner requirejs:chrome_settings requirejs:chrome_inject_embed_inner requirejs:chrome_preview_popover_outer');
  grunt.registerTask('minChromeScripts', 'min:chrome_popover_outer min:chrome_inject_embed_outer min:chrome_overlay_outer min:chrome_popover_inner min:chrome_background_script min:chrome_overlay_inner min:chrome_settings min:chrome_inject_embed_inner min:chrome_preview_popover_outer');

  // Firefox tasks
  grunt.registerTask('fdev', 'context:dev:firefox growl:success');
  grunt.registerTask('fprod', 'context:prod:firefox growl:success');
  grunt.registerTask('flocal', 'context:local:firefox growl:success');
  grunt.registerTask('fstaging', 'context:staging:firefox growl:success');
  grunt.registerTask('requirejsFirefoxScripts', 'requirejs:firefox_popover_outer requirejs:firefox_popover_inner requirejs:firefox_overlay_outer requirejs:firefox_overlay_inner requirejs:firefox_inject_embed_inner requirejs:firefox_inject_embed_outer requirejs:firefox_preview_popover_outer');
  grunt.registerTask('concatFirefox', 'concat:firefox_popover concat:firefox_overlay concat:firefox_embed');
  grunt.registerTask('minFirefoxScripts', 'min:firefox_popover_outer min:firefox_popover_inner min:firefox_overlay_outer min:firefox_overlay_inner min:firefox_inject_embed_inner min:firefox_inject_embed_outer min:firefox_preview_popover_outer');


  // widget embed tasks
  grunt.registerTask('elocal', 'context:local:embed');
  grunt.registerTask('edev', 'context:dev:embed growl:success');
  grunt.registerTask('eprod', 'context:prod:embed');
  grunt.registerTask('estaging', 'context:staging:embed');

  // Global task
  grunt.registerTask('local', 'blocal ilocal wlocal clocal');
  grunt.registerTask('dev', 'bdev idev wdev');

 // Staging - no minification
  grunt.registerTask('websiteStaging', 'lint clean:website requirejs:website copy:website stylus:website');
  grunt.registerTask('bookmarkletStaging', 'lint clean:bookmarklet requirejs:bookmarklet copy:bookmarklet stylus:bookmarklet');
  grunt.registerTask('iframeStaging', 'lint clean:iframe requirejs:iframe copy:iframe copy:iframebis stylus:iframe concat:iframe');
  grunt.registerTask('chromeStaging', 'lint clean:chrome requirejsChromeScripts stylus:chrome copy:chrome concatChrome');

  // Prod
  grunt.registerTask('websiteAll', 'lint clean:website requirejs:website copy:website stylus:website min:website');
  grunt.registerTask('bookmarkletAll', 'lint clean:bookmarklet requirejs:bookmarklet copy:bookmarklet stylus:bookmarklet min:bookmarklet');
  grunt.registerTask('iframeAll', 'lint clean:iframe requirejs:iframe copy:iframe copy:iframebis stylus:iframe concat:iframe min:iframe');
  grunt.registerTask('chromeAll', 'lint clean:chrome requirejsChromeScripts stylus:chrome copy:chrome concatChrome minChromeScripts');
  grunt.registerTask('firefoxAll', 'lint:firefox lint:iframe lint:shared clean:firefox requirejsFirefoxScripts copy:firefox copy:firefox_deps copy:firefox_env stylus:firefox concatFirefox');
  grunt.registerTask('embedAll', 'lint:embed lint:shared requirejs:embed stylus:embed min:embed');

};
