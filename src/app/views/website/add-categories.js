define(['jquery'
       , 'lib/environment'
       , 'lib/utils'
       , 'select2'], function($, env, utils) {

  function addCategories () {
    $('.moderationDone').on('click', function (event) {
      var $button = $(event.currentTarget)
        , $listItem = $button.parent().parent()
        , tldrId = $listItem.data('tldr-id')
        , selectedCategory = $listItem.find('select').val()
        ;

      if (selectedCategory.length === 0) { return; }

      // Give category
      $.ajax({ url: env.apiUrl + '/tldrs/' + tldrId
             , dataType: 'json'
             , data: { categories: selectedCategory }
             , type: 'PUT'
             })
       .done(function () {});

      // Remove from DOM
      $listItem.remove();
    });
  }

  utils.loadCssFile(env.websiteUrl + '/assets/css/select2.css');
  $('.category').select2();

  return addCategories;
});


