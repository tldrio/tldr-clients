
define([ 'jquery'
       , 'lib/environment'
       ], function ($, env) {

  var logInAndOut = {

    login: function (data, success, error, complete) {
      $.ajax({ url: env.apiUrl + '/users/login'
             , type: 'POST'
             , dataType: 'json'
             , data: data
            })
        .done(success)
        .fail(error)
        .always(complete);
    }

  , logout: function (success, error, complete) {
      $.ajax({ url: env.apiUrl + '/users/logout' })
        .done(success)
        .fail(error)
        .always(complete);
    }

  };

  return logInAndOut;

});
