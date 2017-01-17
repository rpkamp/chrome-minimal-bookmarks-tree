/* global window,document,localStorage */

import {
  nothing,
  translateDocument,
  hasClass,
  addClass,
  removeClass,
  getElementData,
} from './functions';
import Settings from './settings';
import {
  buildTree,
  setElementDimensions,
  toggleFolder,
  showContextMenuFolder,
  showContextMenuBookmark,
  openAllBookmarks,
} from './popup/functions';

(function init(settings, chrome) {
  let scrollTimeout;
  const zoom = parseInt(settings.get('zoom'), 10);
  const hideEmptyFolders = settings.get('hide_empty_folders');
  const loading = document.querySelector('#loading');
  const bm = document.querySelector('#bookmarks');

  chrome.bookmarks.getTree((bookmarksTree) => {
    const otherBookmarks = buildTree(
      bookmarksTree[0].children[1],
      hideEmptyFolders,
      true,
    );

    // eslint-disable-next-line no-param-reassign
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
        return nothing(event);
      }
      document.querySelector('#context').style.display = 'none';
      document.querySelectorAll('.selected').forEach((element) => {
        removeClass(element, 'selected');
      });
      if (hasClass(event.target.parentNode, 'folder')) {
        toggleFolder(event.target.parentNode);

        return nothing(event);
      }

      const url = getElementData(event.target.parentNode, 'url');
      if (event.button === 0) {
        if (event.ctrlKey || event.metaKey) {
          chrome.tabs.create({ url, active: false });

          return nothing(event);
        }

        chrome.tabs.query({ active: true }, (tab) => {
          chrome.tabs.update(tab.id, { url });
          window.close();
        });
      }

      return nothing(event);
    });

    bm.addEventListener('contextmenu', (event) => {
      if (!event.target || event.target.nodeName !== 'SPAN') {
        return nothing(event);
      }
      document.querySelector('#context').style.display = 'none';
      document.querySelectorAll('.selected').forEach((element) => {
        removeClass(element, 'selected');
      });
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
        return nothing(event);
      }
      document.querySelector('#context').style.display = 'none';
      document.querySelectorAll('.selected').forEach((element) => {
        removeClass(element, 'selected');
      });
      if (event.button === 1) {
        if (hasClass(event.target.parentNode, 'folder')) {
          openAllBookmarks(event.target.parentNode);

          return nothing(event);
        }
        const url = getElementData(event.target.parentNode, 'url');
        chrome.tabs.create({ url });
      }

      return nothing(event);
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

    document.querySelector('#edit_cancel').addEventListener('click', () => {
      // $('#overlay').slideUp(animationDuration);
      document.querySelector('#overlay').style.display = 'none';
      document.querySelectorAll('.selected').forEach((element) => {
        removeClass(element, 'selected');
      });
    });

    document.querySelector('#edit_name').addEventListener('keyup', (event) => {
      if (event.keyCode === 13) {
        document.querySelector('#edit_save').click();
      }
    });
    document.querySelector('#edit_url').addEventListener('keyup', (event) => {
      if (event.keyCode === 13) {
        document.querySelector('#edit_save').click();
      }
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
    document.querySelector('#context').style.display = 'none';
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
