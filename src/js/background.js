import Settings from './settings';

let settings = new Settings();

const iconPaths = {
  default: 'icons/bookmark48.png',
  star: 'icons/star_fav.png',
  star_empty: 'icons/star_fav_empty.png',
};

window.chrome.browserAction.setIcon({
  path: iconPaths[settings.get('icon')]
});
