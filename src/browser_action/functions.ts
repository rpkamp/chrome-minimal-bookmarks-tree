import {BookmarkOpener} from '../common/BookmarkOpener';
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

// Not enforced by this extension, but hardcoded in chrome.
// So we need to prevent creating a browser action bigger than that, because:
//
//   1. When height > 800 it will cause duplicate vertical scrollbars
//   2. When width > 600 it will cause
//      a) the vertical scrollbar to be out of view
//      b) a horizonal scrollbar to be shown
//
// Also see https://stackoverflow.com/questions/6904755/is-there-a-hardcoded-maximum-height-for-chrome-browseraction-popups
const browserActionMaxHeight = 600;
const browserActionMaxWidth = 800;

export function setElementDimensions(element: HTMLElement | null, preferredWidth: number, preferredHeight: number) {
  if (null === element) {
    return;
  }

  const width: number = Math.floor(
    Math.min(
      browserActionMaxWidth,
      preferredWidth,
    ),
  );

  const height: number = Math.floor(
    Math.min(
      browserActionMaxHeight,
      preferredHeight,
    ),
  );

  element.style.width = `${width}px`;
  element.style.minWidth = `${width}px`;
  element.style.maxWidth = `${width}px`;
  element.style.maxHeight = `${height}px`;
}

export function getElementData(element: HTMLElement, key: string): string {
  const data = element.dataset[key];
  if (typeof data === 'undefined') {
    throw new Error('Element does not have data in key "' + key + '"');
  }

  return data;
}

export function openAllBookmarks(folderId: string): void {
  chrome.bookmarks.getSubTree(folderId, (data: BookmarkTreeNode[]) => {
    BookmarkOpener.openAll(data[0], true);
    window.close();
  });
}

export function elementIndex(element: Element): number {
  if (!(element.parentNode instanceof Element)) {
    return -1;
  }

  return <number>Array.from(element.parentNode.childNodes).filter(
    (elem) => elem.nodeType !== Node.TEXT_NODE
  ).indexOf(element);
}
