var Settings = {
	defaults: {
		'close_old_folder': false,
		'open_all_sub': true,
        'animation_duration': 200,
        'hide_empty_folders': false,
        'remember_scroll_position': true,
        'height': 500,
        'width': 300,
        'zoom': 100,
        'icon': 'default'
	},
    cache: {},
    initialised: false,
	init: function() {
        if (Settings.initialised) {
            return;
        }
		for (var prop in Settings.defaults) {
			var value = localStorage.getItem('setting_'+prop);
			if (value === null) {
                Settings.cache[prop] = Settings.defaults[prop]
				Settings.set(prop, Settings.defaults[prop]);
			} else {
                Settings.cache[prop] = JSON.parse(value)
            }
		}
        Settings.initialised = true;
	},
	get: function(setting) {
		Settings.init();
		return Settings.cache[setting]
	},
	set: function(setting, value) {
        Settings.cache[setting] = value;
		localStorage.setItem('setting_'+setting, JSON.stringify(value));
	}
};