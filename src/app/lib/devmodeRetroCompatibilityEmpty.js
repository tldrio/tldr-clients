/**
 * Module defining DEVMODE if code was not minified and DEVMODE replaced by true or false
 * It is put in a separate module since it makes FF crash so we need to be able to not
 * include it for builds that minify the code
 * This is the empty version
 */

define(['module'], function (module) {

  return {};   // No need to return anything
});
