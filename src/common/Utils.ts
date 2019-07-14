import {BookmarkOpener} from './BookmarkOpener';
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import {ChromeTranslator} from "./translator/ChromeTranslator";
import {Translator} from "./Translator";

export class Utils {
  static translator: Translator = new ChromeTranslator();

  static getElementData(element: HTMLElement, key: string): string {
    const data = element.dataset[key];
    if (typeof data === 'undefined') {
      throw new Error('Element does not have data in key "' + key + '"');
    }

    return data;
  }

  static openAllBookmarks(folderId: string): void {
    chrome.bookmarks.getSubTree(folderId, (data: BookmarkTreeNode[]) => {
      BookmarkOpener.openAll(data[0], true);
      window.close();
    });
  }

  static nothing(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    return false;
  }

  static setBrowserActionIcon(icon: string): void {
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

  static translateDocument(document: Document): void {
    const translatableElements = document.querySelectorAll('[data-i18n-key]');
    translatableElements.forEach((translatableElement: Element) => {
      const key = translatableElement.getAttribute('data-i18n-key');
      if (null === key) {
        return;
      }

      const translation = Utils.translator.translate(key);
      if (translation !== '') {
        translatableElement.innerHTML = translation;
      }
    });
  }

  static addEventListenerMulti(element: Element, events: string, callback: EventListenerOrEventListenerObject) {
    events.split(' ').forEach(event => element.addEventListener(event, callback, false));
  }
}
