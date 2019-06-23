/* global localStorage */

export default class Settings {
  constructor(defaults) {
    this.cache = {};
    this.defaults = defaults || {};
  }

  get(setting) {
    if (typeof this.cache[setting] !== 'undefined') {
      return this.cache[setting];
    }

    let value = null;

    const data = localStorage.getItem(`setting_${setting}`);
    if (data !== null) {
      value = JSON.parse(data);
    } else if (typeof this.defaults[setting] !== 'undefined') {
      value = this.defaults[setting];
    }

    this.cache[setting] = value;
    return value;
  }

  set(setting, value) {
    this.cache[setting] = value;
    localStorage.setItem(`setting_${setting}`, JSON.stringify(value));
  }
}
