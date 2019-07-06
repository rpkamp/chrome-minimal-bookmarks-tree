import * as autoScroll from 'dom-autoscroller';
import * as dragula from '../../node_modules/dragula/dragula';
import {
  nothing,
  translateDocument,
  } from '../common/functions';
import {
  buildTree,
  setElementDimensions,
  toggleFolder,
  showContextMenuFolder,
  showContextMenuBookmark,
  openAllBookmarks,
  removeContextMenu, getElementData, elementIndex,
} from './functions';
import BookmarkDestinationArg = chrome.bookmarks.BookmarkDestinationArg;
import Timeout = NodeJS.Timeout;
import {SettingsFactory} from "../common/settings";
import {BookmarkOpener, BookmarkOpeningDisposition} from "../common/BookmarkOpener";

function openBookmark(url: string, where: string): void {
  let disposition: BookmarkOpeningDisposition;

  let closeWindow: boolean = true;

  switch (where) {
    case 'new':
      disposition = BookmarkOpeningDisposition.foregroundTab;
      break;
    case 'background':
      disposition = BookmarkOpeningDisposition.backgroundTab;
      closeWindow = false;
      break;
    case 'new-window':
      disposition = BookmarkOpeningDisposition.newWindow;
      break;
    case 'new-incognito-window':
      disposition = BookmarkOpeningDisposition.newIncognitoWindow;
      break;
    default:
      disposition = BookmarkOpeningDisposition.activeTab;
  }

  BookmarkOpener.open(url, disposition);

  if (closeWindow) {
    window.close();
  }
}

(function init(settings, chrome) {
  let scrollTimeout: Timeout | null;
  let initialIndexOfDraggable: number | null;
  const font: string = <string>settings.get('font');
  const hideEmptyFolders: boolean = <boolean>settings.get('hide_empty_folders');
  const startWithAllFoldersClosed: boolean = <boolean>settings.get('start_with_all_folders_closed');
  const loading = <HTMLElement>document.querySelector('#loading');
  const bm = <HTMLElement>document.querySelector('#bookmarks');

  chrome.bookmarks.getTree((bookmarksTree) => {
    const otherBookmarks = buildTree(
      bookmarksTree[0].children[1],
      hideEmptyFolders,
      startWithAllFoldersClosed,
      true,
    );

    delete bookmarksTree[0].children[1];
    const bookmarksFolder = buildTree(
      bookmarksTree[0],
      hideEmptyFolders,
      startWithAllFoldersClosed,
      true,
    );

    if (bookmarksFolder) {
      bm.appendChild(bookmarksFolder);
      bm.childNodes.forEach((item: HTMLElement) => {
        if (item.nodeName !== 'LI') {
          return;
        }
        item.classList.add('nosort');
      });
    }
    if (otherBookmarks) {
      bm.appendChild(otherBookmarks);
    }

    bm.addEventListener('click', (event: MouseEvent) => {
      if (!(event.target instanceof HTMLElement)) {
        return false;
      }

      if (event.target.nodeName !== 'SPAN') {
        return false;
      }

      document.querySelectorAll('.selected').forEach((element: HTMLElement) => {
        element.classList.remove('selected');
      });

      removeContextMenu();

      if (event.target.parentNode instanceof HTMLElement && event.target.parentNode.classList.contains('folder')) {
        toggleFolder(event.target.parentNode);

        return false;
      }

      if (event.button !== 0) {
        return false;
      }

      let actionType = 'click_action';

      if (event.ctrlKey || event.metaKey) {
        actionType = 'super_click_action';
      }

      if (event.target.parentNode instanceof HTMLElement) {
        const url = getElementData(event.target.parentNode, 'url');
        openBookmark(url, String(settings.get(actionType)));
      }

      return nothing(event);
    });

    bm.addEventListener('contextmenu', (event: MouseEvent) => {
      if (!(event.target instanceof HTMLElement)) {
        return nothing(event);
      }

      if (event.target.nodeName !== 'SPAN') {
        return nothing(event);
      }

      document.querySelectorAll('.selected').forEach((element: HTMLElement) => {
        element.classList.remove('selected');
      });

      removeContextMenu();

      if (!(event.target.parentNode instanceof HTMLElement)) {
        return nothing(event);
      }

      if (event.target.parentNode.classList.contains('folder')) {
        showContextMenuFolder(event.target.parentNode, {
          x: event.pageX,
          y: event.pageY,
        });

        return nothing(event);
      }

      showContextMenuBookmark(event.target.parentNode, {
        x: event.pageX,
        y: event.pageY,
      });

      return nothing(event);
    });

    bm.addEventListener('mousedown', (event: MouseEvent) => {
      if (!(event.target instanceof HTMLElement)) {
        return false;
      }

      if (event.target.nodeName !== 'SPAN') {
        return false;
      }

      document.querySelectorAll('.selected').forEach((element: HTMLElement) => {
        element.classList.remove('selected');
      });

      removeContextMenu();

      if (event.button === 1 && event.target.parentNode instanceof HTMLElement) {
        if (event.target.parentNode.classList.contains('folder')) {
          openAllBookmarks(event.target.parentNode);

          return nothing(event);
        }
        const url = getElementData(event.target.parentNode, 'url');
        openBookmark(url, String(settings.get('middle_click_action')));
      }

      return false;
    });

    (bm as HTMLElement).style.display = 'block';
    loading.parentNode.removeChild(loading);

    if (settings.get('remember_scroll_position')) {
      const scrolltop = localStorage.getItem('scrolltop');
      if (scrolltop !== null) {
        setTimeout(() => {
          document.querySelector('#wrapper').scrollTop = parseInt(scrolltop, 10);
        }, 100);
      }
    }

    const drake = dragula([bm], {
      isContainer: element => element.classList.contains('sub'),
      moves: element => !element.classList.contains('nosort'),
      accepts: (element, target) => {
        if (element.parentNode.getAttribute('id') === 'bookmarks' && elementIndex(element) === 0) {
          return false;
        }

        return element.classList.contains('folder') || target.classList.contains('sub');
      },
      revertOnSpill: true,
    }).on('drag', (element) => {
      initialIndexOfDraggable = elementIndex(element);
    }).on('drop', (element) => {
      const options: BookmarkDestinationArg = {
        index: elementIndex(element),
      };

      if (options.index > initialIndexOfDraggable) {
        // we need to compensate for the original element that was
        // in the tree but has been moved down
        options.index++;
      }

      if (element.parentNode.getAttribute('id') === 'bookmarks') {
        options.index--;
      } else {
        options.parentId = getElementData(element.parentNode.parentNode, 'item-id');
      }

      chrome.bookmarks.move(getElementData(element, 'item-id'), options);
    });

    autoScroll([
      document.querySelector('#wrapper'),
    ], {
      margin: 20,
      maxSpeed: 5,
      scrollWhenOutside: true,
      autoScroll: function autoScrollCheck() {
        return this.down && drake.dragging;
      },
    });
  });

  document.addEventListener('contextmenu', () => false);

  document.querySelector('#wrapper').addEventListener('scroll', () => {
    if (settings.get('remember_scroll_position')) {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(
        () => {
          localStorage.setItem('scrolltop', String(document.querySelector('#wrapper').scrollTop));
        },
        100
      );
    }
  });

  translateDocument(window.document);

  setElementDimensions(
    document.querySelector('#wrapper'),
    parseInt(<string>settings.get('width'), 10),
    parseInt(<string>settings.get('height'), 10),
  );

  const htmlBodyElement = document.querySelector('body');

  if (font !== '__default__') {
    htmlBodyElement.style.fontFamily = `"${font}"`;
  }

  const theme = settings.get('theme');

  htmlBodyElement.classList.add(`theme--${theme}`);
}(SettingsFactory.create(), chrome));
