import Settings from '../settings';
import { nothing } from '../functions';
import $ from '../../../node_modules/jquery/dist/jquery';

const mbtSettings = new Settings();
let openFoldersDirty = false;
let openFolders = localStorage.getItem('openfolders');

if (openFolders) {
  openFolders = JSON.parse(openFolders);
} else {
  openFolders = [];
}

function addOpenFolder(id) {
  if ($.inArray(id, openFolders) === -1) {
    openFolders.push(id);
    openFoldersDirty = true;
  }
}

function removeOpenFolder(id) {
  let pos = $.inArray(id, openFolders);
  while (pos !== -1) {
    openFoldersDirty = true;
    openFolders.splice(pos, 1);
    pos = $.inArray(id, openFolders);
  }
}

function saveOpenFolders() {
  if (openFoldersDirty) {
    localStorage.setItem('openfolders', JSON.stringify(openFolders));
    openFoldersDirty = false;
  }
}

export function setWidthHeight(tab, preferredWidth, preferredHeight, zoom) {
  const scale = 1 / (zoom / 100);

  const width = scale * Math.min(
    tab.width - 100,
    preferredWidth
  );

  const height = scale * Math.min(
    tab.height - 100,
    preferredHeight
  );

  $('#wrapper')
    .css('max-width', `${width}px`)
    .css('min-width', `${width}px`)
    .width(width)
    .css('max-height', `${height}px`);
}

export function buildTree(treeNode, hideEmptyFolders, level, visible, forceRecursive) {
  if (typeof level === 'undefined') {
    level = 1;
  }
  if (typeof forceRecursive === 'undefined') {
    forceRecursive = false;
  }
  let wrapper;
  let fragmentWrapper = false;
  let d;
  let children;
  let isOpen;
  let loaded;

  if (level > 1) {
    wrapper = $('<ul>');
    wrapper.addClass('sub');
    if (visible) {
      wrapper.show();
    }
  } else {
    wrapper = document.createDocumentFragment();
    fragmentWrapper = true;
  }

  for (const child of treeNode.children) {
    if (typeof child === 'undefined') {
      continue;
    }
    isOpen = $.inArray(child.id, openFolders) !== -1;
    d = $('<li>');

    if (child.url) { // url
      d.data('url', child.url)
        .data('item-id', child.id)
        .append(
          $('<span>', {
            text: child.title,
            title: `${child.title} [${child.url}]`,
          }).css({
            'background-image': `url("chrome://favicon/${child.url}")`,
            'background-repeat': 'no-repeat',
          }).data({
            url: child.url,
          })
        );
    } else { // folder
      d.addClass(`folder${isOpen ? ' open' : ''}`)
        .append($('<span>', { text: child.title }));

      if (hideEmptyFolders && child.children && !child.children.length) {
        // we need to add hidden nodes for these
        // otherwise sorting doesn't work properly
        d.addClass('hidden');
      } else {
        d.data('item-id', child.id)
          .data('level', level)
          .attr('id', `tree${child.id}`);

        if (child.children && child.children.length) {
          loaded = isOpen;
          if (isOpen || forceRecursive) {
            children = buildTree(child, hideEmptyFolders, level + 1, isOpen);
            d.append(children);
            loaded = true;
          }
          d.data('loaded', loaded);
        }
      }
    }
    if (fragmentWrapper) {
      wrapper.appendChild(d[0]);
    } else {
      wrapper.append(d);
    }
  }
  return wrapper;
}

function handleToggleFolder(elem) {
  const animationDuration = parseInt(mbtSettings.get('animation_duration'), 10);

  if (mbtSettings.get('close_old_folder')) {
    $('.folder.open', elem.parent())
      .not(elem)
      .removeClass('open')
      .find('.sub')
      .stop()
      .slideUp(animationDuration);
  }

  elem.toggleClass('open');
  console.log(elem.children('.sub'));
  elem.children('.sub')
    .eq(0)
    .stop()
    .slideToggle(animationDuration, function handleToggleSlideCallback() {
      const id = $(this).parent().data('item-id');
      if (!mbtSettings.get('close_old_folder')) {
        if (!$(this).is(':visible')) {
          removeOpenFolder(id);
          $(this).find('li').each(function closeFolder() {
            removeOpenFolder($(this).data('item-id'));
            $(this).removeClass('open');
            $('.sub', this).hide();
          });
        } else {
          addOpenFolder(id);
        }
      } else {
        const parents = elem.parents('.folder.open');
        if ($(this).is(':visible')) {
          openFolders = [id];
        } else {
          openFolders = [];
        }
        $(parents).each(function openFolder() {
          addOpenFolder($(this).data('item-id'));
        });
      }
      saveOpenFolders();
    });
}

export function toggleFolder(elem) {
  if (!elem.data('loaded')) {
    window.chrome.bookmarks.getSubTree(elem.data('item-id'), (data) => {
      const t = buildTree(
        data[0],
        mbtSettings.get('hide_empty_folders'),
        elem.data('level') + 1
      );
      elem.append(t);
      elem.data('loaded', true);
      handleToggleFolder(elem);
    });

    return;
  }

  handleToggleFolder(elem);
}

function handleOpenAllBookmarks(data) {
  if (data.url) {
    window.chrome.tabs.create({
      url: data.url,
      active: false,
    });
  } else if (data.children) {
    for (const child of data.children) {
      handleOpenAllBookmarks(child);
    }
  }
}

export function openAllBookmarks(folder) {
  window.chrome.bookmarks.getSubTree(folder.data('item-id'), (data) => {
    handleOpenAllBookmarks(data[0]);
    window.close();
  });
}

function contextAction(e, callback) {
  $('#context').hide();
  callback.call();
  return nothing(e);
}

function showContextMenu(e) {
  const $context = $('#context');

  $context.css({
    left: -10000,
  }).show(); // draw offscreen for dimensions

  const windowHeight = $(window).height();
  const contextHeight = $context.height();
  const scrollTop = $('#wrapper').scrollTop();
  let top = scrollTop + e.pageY;
  if (top > scrollTop + windowHeight - contextHeight) {
    top = scrollTop + windowHeight - contextHeight - 15;
  }

  $context.css({
    left: e.pageX,
    top,
  });
}

export function showContextMenuFolder(folder, e) {
  $('#context > li').off('mousedown').hide();
  $('#folder_open_all').show().one('mousedown', (subEvent) => {
    contextAction(subEvent, () => {
      openAllBookmarks(folder);
    });
  });
  $('#folder_delete').show().one('mousedown', (subEvent) => {
    contextAction(subEvent, () => {
      if (confirm('Are you sure you want to delete this folder?')) {
        window.chrome.bookmarks.removeTree(folder.data('item-id'), () => {
          folder.remove();
        });
      }
    });
  });
  $('#folder_edit').show().one('mousedown', (subEvent) => {
    const animationDuration = parseInt(mbtSettings.get('animation_duration'), 10);
    const itemId = folder.data('item-id');
    contextAction(subEvent, () => {
      $('#url_row').hide();
      $('#edit_name').val($('> span', folder).text());
      $('#overlay').slideDown(animationDuration, () => {
        $('#edit_name').focus();
      });
      $('#edit_save').off('click').one('click', () => {
        window.chrome.bookmarks.update(itemId, {
          title: $('#edit_name').val(),
        });
        $('> span', folder).text($('#edit_name').val());
        $('.selected').removeClass('selected');
        $('#overlay').slideUp(animationDuration);
      });
    });
  });
  $(folder).addClass('selected');
  showContextMenu(e);
}

export function showContextMenuBookmark(bookmark, e) {
  $('#context > li').off('mousedown').hide();
  $('#bookmark_delete').show().one('mousedown', (subEvent) => {
    contextAction(subEvent, () => {
      if (confirm('Are you sure you want to delete this bookmark?')) {
        window.chrome.bookmarks.remove(bookmark.data('item-id'), () => {
          bookmark.remove();
        });
      }
    });
  });
  $('#bookmark_edit').show().one('mousedown', (subEvent) => {
    const animationDuration = parseInt(mbtSettings.get('animation_duration'), 10);
    const itemId = bookmark.data('item-id');
    contextAction(subEvent, () => {
      $('#url_row').show();
      $('#edit_name').val($('> span', bookmark).text()).focus();
      $('#edit_url').val($(bookmark).data('url'));
      $('#overlay').slideDown(animationDuration, () => {
        $('#edit_name').focus();
      });
      $('#edit_save').off('click').one('click', () => {
        window.chrome.bookmarks.update(itemId, {
          title: $('#edit_name').val(),
          url: $('#edit_url').val(),
        });
        $('> span', bookmark)
          .text($('#edit_name').val())
          .attr(
            'title',
            `${$('#edit_name').val()} [${$('#edit_url').val()}]`
          );
        $('.selected').removeClass('selected');
        $('#overlay').slideUp(animationDuration);
      });
    });
  });
  $(bookmark).addClass('selected');
  showContextMenu(e);
}
