$(document).ready(function() {
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
});