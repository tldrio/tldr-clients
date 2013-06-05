/**
 * Module defining DEVMODE if code was not minified and DEVMODE replaced by true or false
 * It is put in a separate module since it makes FF crash so we need to be able to not
 * include it for builds that minify the code
 * This is the version with the problematic statement
 */

define(['module'], function (module) {

  // Default DEVMODE setting: keep console.logs
  if (typeof DEVMODE === 'undefined') { DEVMODE = true; }

  return {};   // No need to return anything
});
