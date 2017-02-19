/* global window */

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
  translatableElements.forEach((translatableElement) => {
    const key = translatableElement.getAttribute('data-i18n-key');
    const translation = window.chrome.i18n.getMessage(key);
    if (translation !== '') {
      translatableElement.innerHTML = translation;
    }
  });
}

export function hasClass(element, className) {
  const regex = new RegExp(`(^| )${className}( |$)`);
  return regex.test(element.className);
}

export function addClass(element, className) {
  if (element.className === '') {
    element.className = className;
  } else {
    element.className += ` ${className}`;
  }
}

export function removeClass(element, className) {
  const regex = new RegExp(`\\b${className}( |$)`, 'g');
  element.className = element.className.replace(regex, '').trimRight();
}

export function toggleClass(element, className) {
  if (hasClass(element, className)) {
    removeClass(element, className);
  } else {
    addClass(element, className);
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
  if (!elem.parentNode || !elem.parentNode.className) {
    return parents;
  }
  if (hasClass(elem.parentNode, className)) {
    parents.push(elem);
  }

  return parents.concat(getAncestorsWithClass(elem.parentNode));
}

export function handleOpenAllBookmarks(bookmark) {
  if (bookmark.url) {
    window.chrome.tabs.create({
      url: bookmark.url,
      active: false,
    });

    return;
  }

  if (bookmark.children) {
    bookmark.children.forEach((child) => {
      handleOpenAllBookmarks(child);
    });
  }
}
