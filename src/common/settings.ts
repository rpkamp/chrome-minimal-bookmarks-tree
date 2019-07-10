/* global localStorage */

type Setting = string | number | boolean;

/**
 * Create MBT-agnostic Settings class with defaults
 * for MBT
 */
export class SettingsFactory {
  static settings: Settings | null = null;

  static create(): Settings {
    if (null === this.settings) {
      this.settings = new CachedSettings(
        new LocalStorageSettings({
          close_old_folder: false,
          open_all_sub: true,
          animation_duration: 200,
          start_with_all_folders_closed: false,
          hide_empty_folders: false,
          remember_scroll_position: true,
          height: 500,
          width: 300,
          icon: 'default',
          confirm_bookmark_deletion: true,
          click_action: 'current',
          middle_click_action: 'background',
          super_click_action: 'new',
          font: '__default__',
          theme: 'light',
        })
      )
    }

    return this.settings;
  }
}

/**
 * @internal
 * Exported for testing only
 */
export interface Settings {
  get(setting: string): Setting | null;
  set(setting: string, value: Setting): void;
}

/**
 * @internal
 * Exported for testing only
 */
export class CachedSettings implements Settings {
  cache: { [s: string]: Setting | null; };
  inner: Settings;

  constructor(inner) {
    this.cache = {};
    this.inner = inner;
  }

  get(setting: string): Setting | null {
    if (this.cache.hasOwnProperty(setting)) {
      return this.cache[setting];
    }

    const value = this.inner.get(setting);

    this.cache[setting] = value;

    return value;
  }

  set(setting: string, value: Setting): void {
    this.cache[setting] = value;

    this.inner.set(setting, value);
  }
}

/**
 * @internal
 * Exported for testing only
 */
export class LocalStorageSettings implements Settings {
  defaults: { [s: string]: Setting; };

  constructor(defaults) {
    this.defaults = defaults || {};
  }

  get(setting: string): Setting | null {
    const data = localStorage.getItem(`setting_${setting}`);
    if (data !== null) {
      return JSON.parse(data);
    }

    if (this.defaults.hasOwnProperty(setting)) {
      return this.defaults[setting];
    }

    return null;
  }

  set(setting: string, value: Setting): void {
    localStorage.setItem(`setting_${setting}`, JSON.stringify(value));
  }
}
