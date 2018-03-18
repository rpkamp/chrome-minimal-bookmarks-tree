import Settings from '../common/settings';
import { setBrowserActionIcon } from '../common/functions';
import initialiseOmniboxBookmarksSearch from './omnibox';

const settings = new Settings();

const setDefaultSetting = (key, value) => {
  if (settings.get(key) !== null) {
    return;
  }

  settings.set(key, value);
};

setDefaultSetting('close_old_folder', false);
setDefaultSetting('open_all_sub', true);
setDefaultSetting('animation_duration', 200);
setDefaultSetting('hide_empty_folders', false);
setDefaultSetting('remember_scroll_position', true);
setDefaultSetting('height', 500);
setDefaultSetting('width', 300);
setDefaultSetting('zoom', 100);
setDefaultSetting('icon', 'default');
setDefaultSetting('confirm_bookmark_deletion', true);
setDefaultSetting('click_action', 'current');
setDefaultSetting('middle_click_action', 'background');
setDefaultSetting('super_click_action', 'new');

setBrowserActionIcon(settings.get('icon'));

initialiseOmniboxBookmarksSearch();
