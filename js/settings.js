var Settings = {
	defaults: {
		'close_old_folder': false,
		'open_all_sub': true,
        'animation_duration': 200,
        'hide_empty_folders': false,
        'remember_scroll_position': true
	},
	init: function() {
		for (var prop in Settings.defaults) {
			val = localStorage.getItem('setting_'+prop);
			if (val === null) {
				Settings.set(prop, Settings.defaults[prop]);
			}
		}
	},
	get: function(setting) {
			Settings.init();
			var value = localStorage.getItem('setting_'+setting);
			value = JSON.parse(value);
			return value;
	},
	set: function(setting, value) {
			localStorage.setItem('setting_'+setting, JSON.stringify(value));
	}
};