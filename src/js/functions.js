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
  const regex = new RegExp(`(^| )${className}( |$)`, 'g');
  elements.forEach((element) => {
    element.className = element.className.replace(regex, '');
  });
}

export function toggleClass(element, className) {
  const regex = new RegExp(`(^| )${className}( |$)`, 'g');
  if (regex.test(element.className)) {
    element.className = element.className.replace(regex, '');
  } else {
    element.className += ` ${className}`;
  }
}

export function getElementData(element, key) {
  return element.getAttribute(`data-${key}`);
}

export function setElementData(element, key, value) {
  element.setAttribute(`data-${key}`, value);
}

export function getAncestorsWithClass(elem, className) {
  const parents = [];
  if (!elem.parentNode) {
    return parents;
  }
  const regex = new RegExp(`(^| )${className}( |$)`, 'g');
  if (regex.test(elem.parentNode.className)) {
    parents.push(parent);
  }

  return parents.concat(getAncestorsWithClass(elem.parentNode));
}
