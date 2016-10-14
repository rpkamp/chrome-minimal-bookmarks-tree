import Settings from './settings';
import { setBrowserActionIcon } from './functions';

const settings = new Settings();
setBrowserActionIcon(settings.get('icon'));
