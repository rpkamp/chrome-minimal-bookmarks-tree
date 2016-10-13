(function setIcon(chrome, icon) {
  const paths = {
    default: 'icons/bookmark48.png',
    star: 'icons/star_fav.png',
    star_empty: 'icons/star_fav_empty.png',
  };
  chrome.browserAction.setIcon({ path: paths[icon] });
}(window.chrome, MBT_settings.get('icon')));
