/* global window,Node */

export function nothing(e) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  return false;
}

export function setBrowserActionIcon(icon) {
  const iconPaths = {
    default: '/icons/bookmark48.png',
    star: '/icons/black-star.png',
    star_empty: '/icons/black-open-star.png',
    white_star: '/icons/white-star.png',
    white_star_empty: '/icons/white-open-star.png',
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
    parents.push(elem.parentNode);
  }

  return parents.concat(getAncestorsWithClass(elem.parentNode, className));
}

export function elementIndex(element) {
  if (!element || typeof element.parentNode === 'undefined') {
    return null;
  }
  const parent = element.parentNode;
  const children = parent.childNodes;
  let i = 0;
  for (let j = 0; j < children.length; j++) {
    if (children[j].nodeType === Node.TEXT_NODE) {
      continue;
    }
    if (element === children[j]) {
      return i;
    }
    i++;
  }
  return -1;
}

function getAllBookmarksStartingAt(bookmark) {
  let bookmarks = [];
  if (bookmark.url) {
    bookmarks.push(bookmark.url);
  }

  if (bookmark.children) {
    bookmark.children.forEach((child) => {
      bookmarks = bookmarks.concat(getAllBookmarksStartingAt(child));
    });
  }

  return bookmarks;
}

export function openBookmark(url, where) {
  if (where === 'new') {
    window.chrome.tabs.create({ url, active: true });
    return;
  }

  if (where === 'background') {
    window.chrome.tabs.create({ url, active: false });
    return;
  }

  if (where === 'new-window') {
    window.chrome.windows.create({ url });
    return;
  }

  if (where === 'new-incognito-window') {
    window.chrome.windows.create({ url, incognito: true });
    return;
  }

  window.chrome.tabs.update({ url, active: true });
  window.close();
}

export function handleOpenAllBookmarks(startingBookmark, startWithNewTab) {
  const bookmarks = getAllBookmarksStartingAt(startingBookmark);

  openBookmark(bookmarks[0], startWithNewTab ? 'background' : 'current');

  bookmarks.slice(1).forEach((bookmark) => {
    openBookmark(bookmark, 'background');
  });
}
