import { nothing, translateDocument } from './functions';
import Settings from './settings';
import {
  buildTree,
  setWidthHeight,
  toggleFolder,
  showContextMenuFolder,
  showContextMenuBookmark,
  openAllBookmarks,
} from './popup/functions';
import $ from '../../node_modules/jquery/dist/jquery';

(function init(settings, chrome) {
  let draggingIndex;
  let scrollTimeout;
  const zoom = parseInt(settings.get('zoom'), 10);

  chrome.bookmarks.getTree((bookmarksTree) => {
    let bookmarksBarShown = false;
    const bm = $('#bookmarks');
    let y = $.extend(true, {}, bookmarksTree[0]);
    delete y.children[1]; // "Other boookmarks"

    let tree;
    tree = buildTree(y, settings.get('hide_empty_folders'));
    if (tree) {
      bm[0].appendChild(tree);
      bm.children('li').addClass('nosort');
      bookmarksBarShown = true;
    }
    tree = buildTree(bookmarksTree[0].children[1], settings.get('hide_empty_folders'));
    if (tree) {
      bm[0].appendChild(tree);
    }

    // bm.nestedSortable({
    //   handle: 'span',
    //   items: 'li',
    //   toleranceElement: '> span',
    //   listType: 'ul',
    //   isTree: true,
    //   expandOnHover: 700,
    //   distance: 30,
    //   forcePlaceholderSize: true,
    //   start: (e, ui) => {
    //     const item = ui.item;
    //     const list = item.parent();
    //     draggingIndex = list.children('li').index(item);
    //   },
    //   stop: (e, ui) => {
    //     const item = ui.item;
    //     const itemId = item.data('item-id');
    //     const list = item.parent();
    //     const parent = list.parent();
    //     let parentId = parent.data('item-id');
    //     let idx = list.children('li').index(item);
    //
    //     if (item.hasClass('nosort') || (!parentId && idx === 0 && bookmarksBarShown)) {
    //       alert(chrome.i18n.getMessage('sortNotAllowed'));
    //       bm.sortable('cancel');
    //       return nothing(e);
    //     }
    //     if (draggingIndex < idx) {
    //       // not sure why we need this, but
    //       // it doesn't work if we leave it out
    //       idx++;
    //     }
    //     if (!parentId && bookmarksBarShown) {
    //       idx--;
    //     }
    //     if (!parentId) {
    //       parentId = bookmarksTree[0].children[1].id;
    //     }
    //     chrome.bookmarks.move(itemId, { parentId, index: idx }, (res) => {
    //       if (typeof res === 'undefined') {
    //         // index out of bounds, try with index-1
    //         chrome.bookmarks.move(itemId, { parentId, index: idx - 1 }, (res2) => {
    //           if (typeof res2 === 'undefined') {
    //             // this isn't happening. bail out.
    //             alert(chrome.i18n.getMessage('folderMoveFailed'));
    //             window.close();
    //           }
    //         });
    //       }
    //     });
    //     return true;
    //   }
    // });

    bm.on('click contextmenu', 'li', function clickHandler(e) {
      $('#context').hide();
      $('.selected').removeClass('selected');
      let $this = $(this);
      if ($this.hasClass('folder')) {
        if (e.button === 0) {
          toggleFolder($this);
        } else if (e.button === 2) {
          showContextMenuFolder($this, e);
        }
      } else { // bookmark
        const url = $this.data('url');
        if (e.button === 0) {
          if (e.ctrlKey || e.metaKey) {
            chrome.tabs.create({ url, active: false });
          } else {
            chrome.tabs.query({ active: true }, (tab) => {
              chrome.tabs.update(tab.id, { url });
              window.close();
            });
          }
        } else if (e.button === 2) {
          showContextMenuBookmark($this, e);
        }
      }
      return nothing(e);
    });

    bm.on('mousedown', 'li', function handleMouseDownOnMenuItem(e) {
      $('#context').hide();
      $('.selected').removeClass('selected');
      const $this = $(this);
      if (e.button === 1) {
        if ($this.hasClass('folder')) {
          openAllBookmarks($this);
        } else {
          const url = $this.data('url');
          chrome.tabs.create({ url });
          return nothing(e);
        }
      }
      return null;
    });

    if (settings.get('remember_scroll_position')) {
      const scrolltop = localStorage.getItem('scrolltop');
      if (scrolltop) {
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
    .on('contextmenu', () => {
      return false;
    })
    .ready(function () {
      $('#wrapper').on('scroll', () => {
        if (settings.get('remember_scroll_position')) {
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            localStorage.setItem('scrolltop', $('#wrapper').scrollTop());
          }, 100);
        }
        $('#context').hide();
      });
    });

  chrome.tabs.query({ active: true }, (tabs) => {
    setWidthHeight(
      tabs[0],
      parseInt(settings.get('width'), 10),
      parseInt(settings.get('height'), 10),
      zoom
    );
  });
  if (zoom !== 100) {
    $('html').css('zoom', `${zoom}%`);
  }
  translateDocument(window.document);
}(new Settings(), window.chrome));
