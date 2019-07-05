import { setBrowserActionIcon } from '../common/functions';
import initialiseOmniboxBookmarksSearch from './omnibox';
import {SettingsFactory} from "../common/settings";

window.chrome.runtime.onStartup.addListener(() => {
  const settings = SettingsFactory.create();

  const icon: any = settings.get('icon');
  if (typeof icon === 'string') {
    setBrowserActionIcon(icon);
  }
});

initialiseOmniboxBookmarksSearch();
