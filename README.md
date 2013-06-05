# Clients: Bookmarklet, Iframe, Page, Website

## Architecture

* `dist` is where go all the built components
* `assets` is for all source css and images that will be copied into
  `dist`
* `src` contains the source: `js` files in `app`, stylus files in
  `styl`, 3rd party library in `vendor` and templates in `templates` 
* `config.requirejs.js` is the mainConfigFile for Requirejs which
  declares all configuration options.
* `test` contains integration and unit tests. The former are run with
  CasperJs, the latter with Mocha. To make them run [install CasperJS](http://casperjs.org/installation.html) and
  PhantomJs.
  (`brew install casperjs` for Mac, which will install PhantomJs as
   well)


## Development environment

We use grunt.js to build the source. 

The tasks that grunt does are: check code with jsHint, run RequireJs optimization, 
build stylus files, minify, uglify, clean build folder and copy built
files into build folder.

In our setup there is no proper development environment, which means one have to 
recompile the component to reflect the changes. This can be done 
automatically by launching the watcher task of grunt. For example 
if you are working on the website launch `grunt watch:website` from the
root folder and at every modification of one of the website files, a new
version will be compiled and available at `/dist/website/local/public/`.

We use growl to advertise a successful or failed build. Refer to the
[node-growl install requirements ](https://github.com/visionmedia/node-growl/#installation) to make it work on your machine.


## Bookmarklet links

The bookmarklets links are located in `local-install-bookmarklet.html`.  

## Front end tests

### Integration tests

They can be run with `grunt casperjs` (or more specifically with
`:website`, `:iframe` arguments).

### Unit Tests

They can be run by opening `test/unit/index.test.html` for a complete
report or by running `phantomjs run-mocha.js http://localhost:8888/test/unit/index.test.html`

## Build tests

All our custom made grunt tasks can be tested by running this command: `npm run-script test-grunt-tasks`

## Page development

The development of the page component, even if served by the API, occurs
in this repository and files are copied to the api repository. See `page*` grunt target. The environment variable
`TLDR_API_DIR` must be set to the root of your api directory.





