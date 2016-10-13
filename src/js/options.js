import Settings from './settings';
import jQuery from 'jquery';
import { nothing } from './functions';

(function init($, settings, chrome) {
  $(':input[type="checkbox"]').each(() => {
    const id = $(this).attr('id');
    if (settings.get(id)) {
      $(this).prop('checked', true);
    }
    $(this).on('change click keyup', () => {
      settings.set(id, $(this).prop('checked'));
    });
  });

  $('select').each(() => {
    const id = $(this).attr('id');
    $(this).val(settings.get(id));
    $(this).on('change click keyup', () => {
      settings.set(id, $(this).val());
      if (id === 'icon') {
        chrome.extension.getBackgroundPage().setIcon($(this).val());
      }
    });
  });

  $(':input[type="number"]').each(() => {
    const id = $(this).attr('id');
    $(this).val(settings.get(id));
    $(this)
      .on('change click keyup', () => {
        const v = parseInt($(this).val(), 10);
        const minValue = parseInt($(this).attr('min'), 10);
        const maxValue = parseInt($(this).attr('max'), 10);
        if (isNaN(v) || v < minValue || v > maxValue) {
          $(this).css('border', '1px solid red');
          return;
        }
        $(this).css('border', '');
        settings.set(id, $(this).val());
      })
      .on('blur', (event) => {
        event.target.checkValidity();
      })
      .bind('invalid', (event) => {
        setTimeout(() => {
          $(event.target).focus();
        }, 50);
      });
  });

  $('.license-toggle').on('click', (e) => {
    $('#license').show();
    $(this).hide();
    return nothing(e);
  });

  $('[data-i18n-key]').each((_, elem) => {
    const $elem = $(elem);
    const key = $elem.data('i18n-key');
    const translation = chrome.i18n.getMessage(key);
    if (translation !== '') {
      $elem.html(translation);
    }
  });
}(jQuery, new Settings(), window.chrome));
