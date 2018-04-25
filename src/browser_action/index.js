/* global window,document,localStorage */

import {
  nothing,
  translateDocument,
  hasClass,
  addClass,
  removeClass,
  getElementData,
  elementIndex,
  openBookmark,
} from '../common/functions';
import {
  buildTree,
  setElementDimensions,
  toggleFolder,
  showContextMenuFolder,
  showContextMenuBookmark,
  openAllBookmarks,
  removeContextMenu,
} from './functions';
import Settings from '../common/settings';
import dragula from '../../node_modules/dragula/dragula';

(function init(settings, chrome) {
  let scrollTimeout;
  let initialIndexOfDraggable;
  const zoom = parseInt(settings.get('zoom'), 10);
  const hideEmptyFolders = settings.get('hide_empty_folders');
  const loading = document.querySelector('#loading');
  const bm = document.querySelector('#bookmarks');

  const execScript = ((code) => {
    const head = document.querySelector('head');
    const script = document.createElement('script');
    script.textContent = code;
    head.appendChild(script);
    head.removeChild(script);
  }).toString();

  chrome.bookmarks.getTree((bookmarksTree) => {
    const otherBookmarks = buildTree(
      bookmarksTree[0].children[1],
      hideEmptyFolders,
      true,
    );

    delete bookmarksTree[0].children[1];
    const bookmarksFolder = buildTree(
      bookmarksTree[0],
      hideEmptyFolders,
      true,
    );

    if (bookmarksFolder) {
      bm.appendChild(bookmarksFolder);
      bm.childNodes.forEach((item) => {
        if (item.nodeName !== 'LI') {
          return;
        }
        addClass(item, 'nosort');
      });
    }
    if (otherBookmarks) {
      bm.appendChild(otherBookmarks);
    }

    bm.addEventListener('click', (event) => {
      if (!event.target || event.target.nodeName !== 'SPAN') {
        return false;
      }

      document.querySelectorAll('.selected').forEach((element) => {
        removeClass(element, 'selected');
      });

      removeContextMenu();

      if (hasClass(event.target.parentNode, 'folder')) {
        toggleFolder(event.target.parentNode);

        return false;
      }

      if (event.button !== 0) {
        return false;
      }

      let actionType = 'click_action';

      chrome.tabs.query({ active: true }, (tab) => {
        // Detects bookmarklet
        const bookmarklet = /^javascript:(.*)/i.exec(url);
        if (bookmarklet && bookmarklet[1]) {
          // Run bookmarklet in selected webpage's context
          chrome.tabs.executeScript(tab.id, {
            code: `(${execScript})(${
              JSON.stringify(decodeURIComponent(bookmarklet[1]))
            })`,
          });
        } else {
          chrome.tabs.update(tab.id, { url });
        }
        window.close();
      });
      
      if (event.ctrlKey || event.metaKey) {
        actionType = 'super_click_action';
      }

      const url = getElementData(event.target.parentNode, 'url');
      openBookmark(url, settings.get(actionType));

      return nothing(event);
    });

    bm.addEventListener('contextmenu', (event) => {
      if (!event.target || event.target.nodeName !== 'SPAN') {
        return nothing(event);
      }
      document.querySelectorAll('.selected').forEach((element) => {
        removeClass(element, 'selected');
      });
      removeContextMenu();
      if (hasClass(event.target.parentNode, 'folder')) {
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

    bm.addEventListener('mousedown', (event) => {
      if (!event.target || event.target.nodeName !== 'SPAN') {
        return false;
      }
      document.querySelectorAll('.selected').forEach((element) => {
        removeClass(element, 'selected');
      });
      removeContextMenu();

      if (event.button === 1) {
        if (hasClass(event.target.parentNode, 'folder')) {
          openAllBookmarks(event.target.parentNode);

          return nothing(event);
        }
        const url = getElementData(event.target.parentNode, 'url');
        openBookmark(url, settings.get('middle_click_action'));
      }

      return false;
    });

    bm.style.display = 'block';
    loading.parentNode.removeChild(loading);

    if (settings.get('remember_scroll_position')) {
      const scrolltop = localStorage.getItem('scrolltop');
      if (scrolltop !== null) {
        setTimeout(() => {
          document.querySelector('#wrapper').scrollTop = parseInt(scrolltop, 10);
        }, 100);
      }
    }

    dragula([bm], {
      isContainer: element => hasClass(element, 'sub'),
      moves: element => !hasClass(element, 'nosort'),
      accepts: (element, target) => {
        if (element.parentNode.getAttribute('id') === 'bookmarks' && elementIndex(element) === 0) {
          return false;
        }

        return (hasClass(element, 'folder') || hasClass(target, 'sub'));
      },
      revertOnSpill: true,
    }).on('drag', (element) => {
      initialIndexOfDraggable = elementIndex(element);
    }).on('drop', (element) => {
      const options = {
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
  });

  document.addEventListener('contextmenu', () => false);

  document.querySelector('#wrapper').addEventListener('scroll', () => {
    if (settings.get('remember_scroll_position')) {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        localStorage.setItem('scrolltop', document.querySelector('#wrapper').scrollTop);
      }, 100);
    }
  });

  translateDocument(window.document);

  chrome.tabs.query({ active: true }, (tabs) => {
    setElementDimensions(
      tabs[0],
      '#wrapper',
      parseInt(settings.get('width'), 10),
      parseInt(settings.get('height'), 10),
      zoom,
    );
  });

  if (zoom !== 100) {
    document.querySelector('html').style.zoom = `${zoom}%`;
  }
}(new Settings(), window.chrome));
