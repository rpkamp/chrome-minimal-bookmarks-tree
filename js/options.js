$(document).ready(function() {
    if (Settings.get('close_old_folder')) {
        $('#close_old_folder').prop('checked', true);
    }
    if (Settings.get('open_all_sub')) {
        $('#open_all_sub').prop('checked', true);
    }
    $('#close_old_folder,#open_all_sub').on('click', function() {
        Settings.set($(this).attr('id'), $(this).prop('checked'));
    });
        
    $('#animation_duration').val(Settings.get('animation_duration')).on('change click keyup', function() {
        Settings.set('animation_duration', $(this).val());
    });
});