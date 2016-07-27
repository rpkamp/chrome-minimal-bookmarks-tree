'use strict';

class Settings {
  constructor(defaults) {
    this.cache = {};
    this.defaults = defaults || {};
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
  }

  set(setting, value) {
    this.cache[setting] = value;
    localStorage.setItem(`setting_${setting}`, JSON.stringify(value));
  }
}
