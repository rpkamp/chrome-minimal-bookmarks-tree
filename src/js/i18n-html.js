(function translateHtml($, chrome) {
  document.addEventListener('DOMContentLoaded', () => {
    $('[data-i18n-key]').each((_, elem) => {
      const $elem = $(elem);
      const key = $elem.data('i18n-key');
      const translation = chrome.i18n.getMessage(key);
      if (translation !== '') {
        $elem.html(translation);
      }
    });
  });
}(window.jQuery, window.chrome));
