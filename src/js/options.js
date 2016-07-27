(function($, MBT_settings, chrome) {
  document.addEventListener('DOMContentLoaded', function () {
    $(':input[type="checkbox"]').each(function () {
      var id = $(this).attr('id');
      if (MBT_settings.get(id)) {
        $(this).prop('checked', true);
      }
      $(this).on('change click keyup', function () {
        MBT_settings.set(id, $(this).prop('checked'));
      });
    });
    $('select').each(function () {
      var id = $(this).attr('id');
      $(this).val(MBT_settings.get(id));
      $(this).on('change click keyup', function () {
        MBT_settings.set(id, $(this).val());
        if (id === 'icon') {
          chrome.extension.getBackgroundPage().setIcon($(this).val());
        }
      });
    });
    $(':input[type="number"]').each(function () {
      var id = $(this).attr('id');
      $(this).val(MBT_settings.get(id));
      $(this).on('change click keyup', function () {
        var v = parseInt($(this).val(), 10);
        var minValue = parseInt($(this).attr('min'), 10);
        var maxValue = parseInt($(this).attr('max'), 10);
        if (isNaN(v) || v < minValue || v > maxValue) {
          $(this).css('border', '1px solid red');
          return;
        }
        $(this).css('border', '');
        MBT_settings.set(id, $(this).val());
      }).on('blur', function (event) {
        event.target.checkValidity();
      }).bind('invalid', function (event) {
        setTimeout(function () {
          $(event.target).focus();
        }, 50);
      });
    });
    $('.license-toggle').on('click', function (e) {
      $('#license').show();
      $(this).hide();
      e.preventDefault();
      return false;
    });
  });
}(window.jQuery, window.MBT_settings, window.chrome));