/* global window,Node */

import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import {BookmarkOpener, BookmarkOpeningDisposition} from "./BookmarkOpener";

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

  chrome.browserAction.setIcon({
    path: iconPaths[icon],
  });
}

export function translateDocument(document: Document): void {
  const translatableElements = document.querySelectorAll('[data-i18n-key]');
  translatableElements.forEach((translatableElement: Element) => {
    const key = translatableElement.getAttribute('data-i18n-key');
    const translation = chrome.i18n.getMessage(key);
    if (translation !== '') {
      translatableElement.innerHTML = translation;
    }
  });
}

export function getElementData(element: HTMLElement, key: string): string {
  return element.getAttribute(`data-${key}`);
}

export function setElementData(element: HTMLElement, key: string, value: string): void {
  element.setAttribute(`data-${key}`, value);
}

export function getAncestorsWithClass(element: Element, className: string): HTMLElement[] {
  const parents = [];

  if (!(element.parentNode instanceof Element)) {
    return parents;
  }

  if (element.parentNode.classList.contains(className)) {
    parents.push(element.parentNode);
  }

  return parents.concat(getAncestorsWithClass(element.parentNode, className));
}

export function elementIndex(element: Element): number {
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
