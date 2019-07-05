/* global window,Node */

import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

export function nothing(e: Event) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  return false;
}

export function setBrowserActionIcon(icon: string): void {
  const iconPaths: { [s: string]: string } = {
    default: '/icons/bookmark48.png',
    star: '/icons/black-star.png',
    star_empty: '/icons/black-open-star.png',
    white_star: '/icons/white-star.png',
    white_star_empty: '/icons/white-open-star.png',
  };

  if (!iconPaths.hasOwnProperty(icon)) {
    return;
  }

  window.chrome.browserAction.setIcon({
    path: iconPaths[icon],
  });
}

export function translateDocument(document: Document): void {
  const translatableElements = document.querySelectorAll('[data-i18n-key]');
  translatableElements.forEach((translatableElement: Element) => {
    const key = translatableElement.getAttribute('data-i18n-key');
    const translation = window.chrome.i18n.getMessage(key);
    if (translation !== '') {
      translatableElement.innerHTML = translation;
    }
  });
}

export function hasClass(element: HTMLElement, className: string): boolean {
  const regex = new RegExp(`(^| )${className}( |$)`);

  return regex.test(element.className);
}

export function addClass(element: HTMLElement, className: string): void {
  if (element.className === '') {
    element.className = className;
  } else {
    element.className += ` ${className}`;
  }
}

export function removeClass(element: HTMLElement, className: string): void {
  const regex = new RegExp(`\\b${className}( |$)`, 'g');

  element.className = element.className.replace(regex, '').trimRight();
}

export function toggleClass(element: HTMLElement, className: string): void {
  if (hasClass(element, className)) {
    removeClass(element, className);
  } else {
    addClass(element, className);
  }
}

export function getElementData(element: HTMLElement, key: string): string {
  return element.getAttribute(`data-${key}`);
}

export function setElementData(element: HTMLElement, key: string, value: string): void {
  element.setAttribute(`data-${key}`, value);
}

export function getAncestorsWithClass(element: HTMLElement, className: string): HTMLElement[] {
  const parents = [];

  if (!(element.parentNode instanceof HTMLElement)) {
    return parents;
  }

  if (hasClass(element.parentNode, className)) {
    parents.push(element.parentNode);
  }

  return parents.concat(getAncestorsWithClass(element.parentNode, className));
}

export function elementIndex(element: HTMLElement): number {
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

function getAllBookmarksStartingAt(bookmark: BookmarkTreeNode): string[] {
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

export function openBookmark(url: string, where: string): void {
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

export function handleOpenAllBookmarks(startingBookmark: BookmarkTreeNode, startWithNewTab: boolean): void {
  const bookmarks = getAllBookmarksStartingAt(startingBookmark);

  openBookmark(bookmarks[0], startWithNewTab ? 'background' : 'current');

  bookmarks.slice(1).forEach((bookmark: string) => {
    openBookmark(bookmark, 'background');
  });
}
