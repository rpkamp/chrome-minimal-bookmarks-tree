import {Settings} from "../Settings";
import {CachedSettings} from "./CachedSettings";
import {LocalStorageSettings} from "./LocalStorageSettings";

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
          keyboard_support: false
        })
      )
    }

    return this.settings;
  }
}
