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
    $('#animation_duration').val(Settings.get('animation_duration')).on('change click keyup', function() {
        Settings.set('animation_duration', $(this).val());
    });
});