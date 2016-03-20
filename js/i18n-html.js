document.addEventListener('DOMContentLoaded', function() {
    $('[data-i18n-key]').each(function(i, elem) {
        var $this = $(this);
        var key = $this.data('i18n-key');
        var translation = chrome.i18n.getMessage(key);
        if (translation !== "") {
            $(this).html(translation);
        }
    });
});
