import {Settings} from "../Settings";
import {PersistedSettings} from "./PersistedSettings";

/**
 * Create MBT-agnostic Settings class with defaults
 * for MBT
 */
export class SettingsFactory {
  static settings: Settings | null = null;

  static async create(): Promise<Settings> {
    if (null === this.settings) {
      const defaults = {
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
        keyboard_support: false
      };
      const values = await chrome.storage.sync.get(defaults);

      if (typeof values['close_old_folder'] === 'undefined' && typeof localStorage !== 'undefined') {
        // Migrate from localStorage to chrome storage.
        // Only options and browser action can migrate, as service worker doesn't have access to localStorage.
        for (const key of Object.keys(defaults)) {
          const value = localStorage.getItem(`setting_${key}`);
          if (null === value) {
            continue;
          }
          const decodedValue = JSON.parse(value);
          await chrome.storage.sync.set({ [key]: decodedValue });
          values[key] = decodedValue;
        }
      }

      this.settings = new PersistedSettings(
        values,
        (key: string, value: any) => chrome.storage.sync.set({ [key]: value }),
      )
    }

    return this.settings;
  }
}
