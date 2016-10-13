export default class Settings {
  constructor() {
    this.cache = {};
    this.defaults = {
      close_old_folder: false,
      open_all_sub: true,
      animation_duration: 200,
      hide_empty_folders: false,
      remember_scroll_position: true,
      height: 500,
      width: 300,
      zoom: 100,
      icon: 'default',
    };
  }

  get(setting) {
    if (this.cache[setting]) {
      return this.cache[setting];
    }

    const data = localStorage.getItem(`setting_${setting}`);
    if (data) {
      return JSON.parse(data);
    }

    if (this.defaults.hasOwnProperty(setting)) {
      return this.defaults[setting];
    }

    return null;
  }

  set(setting, value) {
    this.cache[setting] = value;
    localStorage.setItem(`setting_${setting}`, JSON.stringify(value));
  }
}
