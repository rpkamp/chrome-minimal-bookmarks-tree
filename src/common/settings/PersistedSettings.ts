import {Settings} from "../Settings";

export class PersistedSettings implements Settings {
  settings: { [s: string]: string | number | boolean; };
  setter: (key: string, value: any) => void;

  constructor(
      settings: { [s: string]: string | number | boolean; },
      setter: (key: string, value: any) => void,
  ) {
    this.settings = settings || {};
    this.setter = setter;
  }

  set(setting: string, value: string | number | boolean): void {
    this.settings[setting] = value;
    (this.setter)(setting, value);
  }

  getNumber(setting: string): number {
    const value = this.settings[setting];
    if (typeof value == 'string') {
      return parseInt(value, 10);
    }

    if (typeof value !== 'number') {
      throw new Error(`Setting "${setting} is not a number!`);
    }

    return value;
  }

  getString(setting: string): string {
    const value = this.settings[setting];
    if (typeof value === 'number') {
      return String(value);
    }

    if (typeof value !== 'string') {
      throw new Error(`Setting "${setting} is not a string!`);
    }

    return value;
  }

  isEnabled(setting: string): boolean {
    const value = this.settings[setting];
    if (typeof value !== 'boolean') {
      throw new Error(`Setting "${setting} is not a boolean!`);
    }

    return value;
  }
}
