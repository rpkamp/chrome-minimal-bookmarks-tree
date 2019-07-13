import { setBrowserActionIcon } from '../common/functions';
import initialiseOmniboxBookmarksSearch from './omnibox';
import {SettingsFactory} from '../common/settings/SettingsFactory';

chrome.runtime.onStartup.addListener(() => {
  const settings = SettingsFactory.create();

  setBrowserActionIcon(settings.getString('icon'));
});

initialiseOmniboxBookmarksSearch();
