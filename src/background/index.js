/* global chrome */

import Settings from '../common/settings';
import { setBrowserActionIcon } from '../common/functions';
import initialiseOmniboxBookmarksSearch from './omnibox';

const settings = new Settings();

function setDefaultSetting(key, value) {
  if (settings.get(key) === null) {
    settings.set(key, value);
  }
}

const version = settings.get('default_settings_version');
if (version === null) {
  setDefaultSetting('close_old_folder', false);
  setDefaultSetting('open_all_sub', true);
  setDefaultSetting('animation_duration', 200);
  setDefaultSetting('hide_empty_folders', false);
  setDefaultSetting('remember_scroll_position', true);
  setDefaultSetting('height', 500);
  setDefaultSetting('width', 300);
  setDefaultSetting('zoom', 100);
  setDefaultSetting('icon', 'default');

  settings.set('default_settings_version', 1);
}

setBrowserActionIcon(settings.get('icon'));

initialiseOmniboxBookmarksSearch();
