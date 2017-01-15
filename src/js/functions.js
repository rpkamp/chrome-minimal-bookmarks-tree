export function nothing(e) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  return false;
}

export function addEventListenerMulti(element, events, callback) {
  events.split(' ').forEach(event => element.addEventListener(event, callback, false));
}

export function setBrowserActionIcon(icon) {
  const iconPaths = {
    default: 'icons/bookmark48.png',
    star: 'icons/star_fav.png',
    star_empty: 'icons/star_fav_empty.png',
  };

  window.chrome.browserAction.setIcon({
    path: iconPaths[icon],
  });
}

export function translateDocument(document) {
  const translatableElements = document.querySelectorAll('[data-i18n-key]');
  for (const translatableElement of translatableElements) {
    const key = translatableElement.getAttribute('data-i18n-key');
    const translation = window.chrome.i18n.getMessage(key);
    if (translation !== '') {
      translatableElement.innerHTML = translation;
    }
  }
}

export function removeClass(elements, className) {
  const regex = new RegExp(`(^| )${className}( |$)`);
  elements.forEach((element) => {
    element.className = element.className.replace(regex, '');
  });
}
