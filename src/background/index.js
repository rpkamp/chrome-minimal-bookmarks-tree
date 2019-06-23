import SettingsFactory from '../common/settings_factory';
import { setBrowserActionIcon } from '../common/functions';
import initialiseOmniboxBookmarksSearch from './omnibox';

const settings = SettingsFactory.create();

if (settings.get('icon') !== null) {
  setBrowserActionIcon(settings.get('icon'));
}

initialiseOmniboxBookmarksSearch();
