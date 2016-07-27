var draggingIndex;

(function ($) {
  var zoom = parseInt(MBT_settings.get('zoom'), 10);
  chrome.tabs.query({ active: true }, function (tabs) {
    setWidthHeight(
      tabs[0],
      parseInt(MBT_settings.get('width'), 10),
      parseInt(MBT_settings.get('height'), 10),
      zoom
    );
  });
  if (zoom !== 100) {
    $('html').css('zoom', zoom + '%');
  }
}(window.jQuery));

function init($) {
  chrome.bookmarks.getTree(function (bookmarksTree) {
    var bookmarksBarShown = false;
    var bm = $('#bookmarks');
    var y = jQuery.extend(true, {}, bookmarksTree[0]);
    delete y.children[1]; // "Other boookmarks"

    var tree;
    tree = buildTree(y);
    if (tree) {
      bm[0].appendChild(tree);
      bm.children('li').addClass('nosort');
      bookmarksBarShown = true;
    }
    tree = buildTree(bookmarksTree[0].children[1]);
    if (tree) {
      bm[0].appendChild(tree);
    }

    bm.nestedSortable({
      handle: 'span',
      items: 'li',
      toleranceElement: '> span',
      listType: 'ul',
      isTree: true,
      expandOnHover: 700,
      distance: 30,
      forcePlaceholderSize: true,
      start: function (e, ui) {
        var item = ui.item,
          list = item.parent();
        draggingIndex = list.children('li').index(item);
      },
      stop: function (e, ui) {
        var item = ui.item,
          itemId = item.data('item-id'),
          list = item.parent(),
          parent = list.parent(),
          parentId = parent.data('item-id'),
          idx = list.children('li').index(item);

        if (item.hasClass('nosort') || (!parentId && idx === 0 && bookmarksBarShown)) {
          alert(chrome.i18n.getMessage("sortNotAllowed"));
          bm.sortable('cancel');
          return nothing(e);
        }
        if (draggingIndex < idx) {
          // not sure why we need this, but
          // it doesn't work if we leave it out
          idx++;
        }
        if (!parentId && bookmarksBarShown) {
          idx--;
        }
        if (!parentId) {
          parentId = bookmarksTree[0].children[1].id;
        }
        chrome.bookmarks.move(itemId, { parentId: parentId, index: idx }, function (res) {
          if (typeof res === 'undefined') {
            // index out of bounds, try with index-1
            chrome.bookmarks.move(itemId, { parentId: parentId, index: idx - 1 }, function (res) {
              if (typeof res === 'undefined') {
                // this isn't happening. bail out.
                alert(chrome.i18n.getMessage("folderMoveFailed"));
                window.close();
              }
            });
          }
        });
      }
    });

    bm.on('click contextmenu', 'li', function (e) {
      $('#context').hide();
      $('.selected').removeClass('selected');
      var $this = $(this);
      if ($this.hasClass('folder')) {
        if (e.button === 0) {
          toggleFolder($this);
        } else if (e.button == 2) {
          showContextMenuFolder($this, e);
        }
      } else { // bookmark
        var url = $this.data('url');
        if (e.button === 0) {
          if (e.ctrlKey || e.metaKey) {
            chrome.tabs.create({ url: url, active: false });
          } else {
            chrome.tabs.query({ active: true }, function (tab) {
              chrome.tabs.update(tab.id, { url: url });
              window.close();
            });
          }
        } else if (e.button === 2) {
          showContextMenuBookmark($this, e);
        }
      }
      return nothing(e);
    });

    bm.on('mousedown', 'li', function (e) {
      $('#context').hide();
      $('.selected').removeClass('selected');
      var $this = $(this);
      if (e.button === 1) {
        if ($this.hasClass('folder')) {
          _openAllBookmarks($this);
        } else {
          var url = $this.data('url');
          chrome.tabs.create({ url: url });
          return nothing(e);
        }
      }
    });

    if (MBT_settings.get('remember_scroll_position')) {
      var scrolltop = localStorage.getItem('scrolltop');
      if (scrolltop) {
        $('#wrapper').scrollTop(parseInt(scrolltop, 10));
      }
    }

    bm.show();
    $('#loading').remove();
    $('#edit_cancel').on('click', function () {
      var animationDuration = parseInt(MBT_settings.get('animation_duration'), 10);
      $('#overlay').slideUp(animationDuration);
      $('.selected').removeClass('selected');
    });
    $('#edit_name, #edit_url').on('keyup', function (e) {
      if (e.keyCode === 13) {
        $('#edit_save').click();
      }
    });
  });
}

var scrollTimeout;

(function ($) {
  $(document)
    .on('contextmenu', function () {
      return false;
    })
    .ready(function () {
      $('#wrapper').on('scroll', function () {
        if (MBT_settings.get('remember_scroll_position')) {
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(function () {
            localStorage.setItem('scrolltop', $('#wrapper').scrollTop());
          });
        }
        $('#context').hide();
      });
    });
}(window.jQuery));

init(window.jQuery);
