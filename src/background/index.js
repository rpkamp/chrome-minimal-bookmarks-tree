/* global window */
import SettingsFactory from '../common/settings_factory';
import { setBrowserActionIcon } from '../common/functions';
import initialiseOmniboxBookmarksSearch from './omnibox';

window.chrome.runtime.onStartup.addListener(() => {
  const settings = SettingsFactory.create();

  if (settings.get('icon') !== null) {
    setBrowserActionIcon(settings.get('icon'));
  }
});

initialiseOmniboxBookmarksSearch();
