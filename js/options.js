document.addEventListener('DOMContentLoaded', function() {
    $(':input[type="checkbox"]').each(function() {
        var id = $(this).attr('id');
        if (Settings.get(id)) {
            $(this).prop('checked', true);
        }
        $(this).on('change click keyup', function() {
            Settings.set(id, $(this).prop('checked'));
        });
    });
    $('select').each( function() {
        var id = $(this).attr('id');
        $(this).val(Settings.get(id));
        $(this).on('change click keyup', function() {
            Settings.set(id, $(this).val());
            console.log(id);
            if (id === 'icon') {
                console.log(chrome.extension.getBackgroundPage().setIcon);
                chrome.extension.getBackgroundPage().setIcon($(this).val());
            }
        });
    });
    $(':input[type="number"]').each(function() {
        var id = $(this).attr('id');
        $(this).val(Settings.get(id));
        $(this).on('change click keyup', function() {
            var v = parseInt($(this).val(), 10);
            var minValue = parseInt($(this).attr('min'), 10);
            var maxValue = parseInt($(this).attr('max'), 10);
            if (isNaN(v) || v < minValue || v > maxValue) {
                $(this).css('border', '1px solid red');
                return;
            }
            $(this).css('border', '');
            Settings.set(id, $(this).val());
        }).on('blur', function(event) {
            event.target.checkValidity();
        }).bind('invalid', function(event) {
            setTimeout(function() { $(event.target).focus();}, 50);
        });
    });
    $('.license-toggle').on('click', function(e) {
        $('#license').show();
        $(this).hide();
        e.preventDefault();
        return false;
    });
});



console.log('DEBUG INFO:');
var Info = function(type, key, value) { this.type = type; this.key = key; this.value = value; };
var infos = [];

var settings = ['close_old_folder', 'open_all_sub', 'animation_duration', 'hide_empty_folders', 'remember_scroll_position', 'height', 'width', 'zoom', 'icon'];
for (var i in settings) {
    infos.push(new Info('setting', settings[i], localStorage.getItem('setting_' + settings[i])));
}

var helpers = ['openfolders', 'scrolltop'];
for (var i in helpers) {
    infos.push(new Info('local cache', helpers[i], localStorage.getItem(helpers[i])));
}

console.table(infos, ['type', 'key', 'value']);
