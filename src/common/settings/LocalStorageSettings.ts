import {Settings} from "../Settings";

export class LocalStorageSettings implements Settings {
  defaults: { [s: string]: string | number | boolean; };

  constructor(defaults: { [s: string]: string | number | boolean; }) {
    this.defaults = defaults || {};
  }

  private get(setting: string): string | number | boolean {
    const data = localStorage.getItem(`setting_${setting}`);
    if (data !== null) {
      return JSON.parse(data);
    }

    if (this.defaults.hasOwnProperty(setting)) {
      return this.defaults[setting];
    }

    throw new Error(`Unable to resolve setting "${setting}"`);
  }

  set(setting: string, value: string | number | boolean): void {
    localStorage.setItem(`setting_${setting}`, JSON.stringify(value));
  }

  getNumber(setting: string): number {
    const value = this.get(setting);
    if (typeof value == 'string') {
      return parseInt(value, 10);
    }

    if (typeof value !== 'number') {
      throw new Error(`Setting "${setting} is not a number!`);
    }

    return value;
  }

  getString(setting: string): string {
    const value = this.get(setting);
    if (typeof value === 'number') {
      return String(value);
    }

    if (typeof value !== 'string') {
      throw new Error(`Setting "${setting} is not a string!`);
    }

    return value;
  }

  isEnabled(setting: string): boolean {
    const value = this.get(setting);
    if (typeof value !== 'boolean') {
      throw new Error(`Setting "${setting} is not a boolean!`);
    }

    return value;
  }
}
