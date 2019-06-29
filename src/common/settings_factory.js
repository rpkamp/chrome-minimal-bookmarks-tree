import Settings from './settings';

/**
 * Create MBT-agnostic Settings class with defaults
 * for MBT
 */
export default class {
  static create() {
    return new Settings({
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
    });
  }
}
