define(['vendor/easyXDM/easyXDM'], function(){
  // Tell Require.js that this module returns a reference to easyXDM
  //return easyXDM;
  var myEasyXDM = easyXDM.noConflict("TLDR_D4A6EBE3");
  window.TLDR_D4A6EBE3 = window.TLDR_D4A6EBE3 || {};
  window.TLDR_D4A6EBE3.easyXDM = myEasyXDM;
  return myEasyXDM;
});
