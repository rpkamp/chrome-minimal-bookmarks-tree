import { nothing, translateDocument } from './functions';
import Settings from './settings';
import {
  buildTree,
  setElementDimensions,
  toggleFolder,
  showContextMenuFolder,
  showContextMenuBookmark,
  openAllBookmarks,
} from './popup/functions';
import $ from '../../node_modules/jquery/dist/jquery';

(function init(settings, chrome) {
  let scrollTimeout;
  const zoom = parseInt(settings.get('zoom'), 10);
  const hideEmptyFolders = settings.get('hide_empty_folders');

  chrome.bookmarks.getTree((bookmarksTree) => {
    const otherBookmarks = buildTree(
      bookmarksTree[0].children[1],
      hideEmptyFolders
    );

    delete bookmarksTree[0].children[1];
    const bookmarksFolder = buildTree(
      bookmarksTree[0],
      hideEmptyFolders
    );

    const bm = $('#bookmarks');
    if (bookmarksFolder) {
      bm[0].appendChild(bookmarksFolder);
      bm.children('li').addClass('nosort');
    }
    if (otherBookmarks) {
      bm[0].appendChild(otherBookmarks);
    }

    bm.on('click', 'li', (event) => {
      $('#context').hide();
      $('.selected').removeClass('selected');
      const $this = $(event.currentTarget);
      if ($this.hasClass('folder')) {
        toggleFolder($this);

        return nothing(event);
      }

      const url = $this.data('url');
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

    bm.on('contextmenu', 'li', (event) => {
      $('#context').hide();
      $('.selected').removeClass('selected');
      const $this = $(event.currentTarget);
      if ($this.hasClass('folder')) {
        showContextMenuFolder($this, event);

        return nothing(event);
      }

      const url = $this.data('url');
      showContextMenuBookmark($this, event);

      return nothing(event);
    });

    bm.on('mousedown', 'li', (event) => {
      $('#context').hide();
      $('.selected').removeClass('selected');
      const $this = $(event.currentTarget);
      if (event.button === 1) {
        if ($this.hasClass('folder')) {
          openAllBookmarks($this);

          return nothing(event);
        }
        const url = $this.data('url');
        chrome.tabs.create({ url });

        return nothing(event);
      }

      return nothing(event);
    });

    if (settings.get('remember_scroll_position')) {
      const scrolltop = localStorage.getItem('scrolltop');
      if (scrolltop !== null) {
        $('#wrapper').scrollTop(parseInt(scrolltop, 10));
      }
    }

    bm.show();
    $('#loading').remove();

    $('#edit_cancel').on('click', () => {
      const animationDuration = parseInt(settings.get('animation_duration'), 10);
      $('#overlay').slideUp(animationDuration);
      $('.selected').removeClass('selected');
    });
    $('#edit_name, #edit_url').on('keyup', (e) => {
      if (e.keyCode === 13) {
        $('#edit_save').click();
      }
    });
  });

  $(document)
    .on('contextmenu', () => false)
    .ready(() => {
      $('#wrapper').on('scroll', () => {
        if (settings.get('remember_scroll_position')) {
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            localStorage.setItem('scrolltop', $('#wrapper').scrollTop());
          }, 100);
        }
        $('#context').hide();
      });
      translateDocument(window.document);
    });

  chrome.tabs.query({ active: true }, (tabs) => {
    setElementDimensions(
      tabs[0],
      '#wrapper',
      parseInt(settings.get('width'), 10),
      parseInt(settings.get('height'), 10),
      zoom
    );
  });
  if (zoom !== 100) {
    $('html').css('zoom', `${zoom}%`);
  }
}(new Settings(), window.chrome));
