/* global window, document */

import Settings from '../settings';
import PersistentSet from '../PersistentSet';
import {
  nothing,
  getElementData,
  setElementData,
  toggleClass,
  getAncestorsWithClass,
  addClass,
  removeClass,
} from '../functions';
import $ from '../../../node_modules/jquery/dist/jquery';

const mbtSettings = new Settings();
const openFolders = new PersistentSet('openfolders');

export function setElementDimensions(tab, selector, preferredWidth, preferredHeight, zoom) {
  const scale = 1 / (zoom / 100);

  const width = scale * Math.min(
    tab.width - 100,
    preferredWidth,
  );

  const height = scale * Math.min(
    tab.height - 100,
    preferredHeight,
  );

  const elem = document.querySelector(selector);
  if (elem === null) {
    return;
  }

  elem.style.width = `${width}px`;
  elem.style.minWidth = `${width}px`;
  elem.style.maxWidth = `${width}px`;
  elem.style.maxHeight = `${height}px`;
}

export function buildTree(
  treeNode,
  hideEmptyFolders,
  topLevel = false,
  visible = true,
) {
  let wrapper;
  let d;
  let children;
  let isOpen;

  if (topLevel) {
    wrapper = document.createDocumentFragment();
  } else {
    wrapper = document.createElement('ul');
    wrapper.className = 'sub';
    if (visible) {
      wrapper.style.display = 'block';
    }
  }

  treeNode.children.forEach((child) => {
    if (typeof child === 'undefined') {
      return;
    }
    isOpen = openFolders.contains(child.id);
    d = document.createElement('li');

    if (child.url) { // url
      setElementData(d, 'url', child.url);
      setElementData(d, 'item-id', child.id);

      const bookmark = document.createElement('span');
      bookmark.innerText = child.title;
      bookmark.title = `${child.title} [${child.url}]`;
      bookmark.style.backgroundImage = `url("chrome://favicon/${child.url}")`;
      bookmark.style.backgroundRepeat = 'no-repeat';
      d.appendChild(bookmark);
    } else { // folder
      addClass(d, 'folder');
      if (isOpen) {
        addClass(d, 'open');
      }

      const folder = document.createElement('span');
      folder.innerText = child.title;
      d.appendChild(folder);

      if (hideEmptyFolders && child.children && !child.children.length) {
        // we need to add hidden nodes for these
        // otherwise sorting doesn't work properly
        addClass(d, 'hidden');
      } else {
        setElementData(d, 'item-id', child.id);
        d.setAttribute('id', `tree${child.id}`);

        if (child.children && child.children.length) {
          if (isOpen) {
            children = buildTree(child, hideEmptyFolders, false, isOpen);
            d.appendChild(children);
          }
          setElementData(d, 'loaded', isOpen ? '1' : '0');
        }
      }
    }

    wrapper.appendChild(d);
  });

  return wrapper;
}

function handleToggleFolder(element) {
  if (mbtSettings.get('close_old_folder')) {
    element.parentNode.querySelectorAll('.folder.open').forEach((openFolderElement) => {
      if (openFolderElement !== element) {
        removeClass(openFolderElement, 'open');
        openFolderElement.querySelectorAll('.sub').forEach((elementToHide) => {
          // @TODO: slide
          // eslint-disable-next-line no-param-reassign
          elementToHide.style.display = 'none';
        });
      }
    });
  }

  toggleClass(element, 'open');
  // @TODO: slide
  const elementToToggle = element.querySelectorAll('.sub')[0];
  elementToToggle.style.display =
    elementToToggle.style.display === 'block' ? 'none' : 'block';

  const id = getElementData(elementToToggle.parentNode, 'item-id');
  if (mbtSettings.get('close_old_folder')) {
    const parents = getAncestorsWithClass(element, 'open');
    openFolders.clear();
    if (elementToToggle.style.display === 'block') {
      openFolders.add(id);
    }
    parents.forEach((parent) => {
      openFolders.add(getElementData(parent, 'item-id'));
    });

    return;
  }

  if (elementToToggle.style.display === 'block') {
    openFolders.add(id);

    return;
  }

  openFolders.remove(id);
  elementToToggle.querySelectorAll('li').forEach((folderToHide) => {
    openFolders.remove(getElementData(folderToHide, 'item-id'));
    // eslint-disable-next-line no-param-reassign
    folderToHide.className = folderToHide.className.replace(/(^| )open( |$)/, '');
    folderToHide.querySelectorAll('.sub').forEach((sub) => {
      // eslint-disable-next-line no-param-reassign
      sub.style.display = 'none';
    });
  });
}

export function toggleFolder(elem) {
  if (getElementData(elem, 'loaded') === '1') {
    handleToggleFolder(elem);

    return;
  }

  window.chrome.bookmarks.getSubTree(getElementData(elem, 'item-id'), (data) => {
    const t = buildTree(
      data[0],
      mbtSettings.get('hide_empty_folders'),
      false,
      false,
    );
    elem.appendChild(t);
    setElementData(elem, 'loaded', '1');
    handleToggleFolder(elem);
  });
}

function handleOpenAllBookmarks(data) {
  if (data.url) {
    window.chrome.tabs.create({
      url: data.url,
      active: false,
    });

    return;
  }

  if (data.children) {
    data.children.forEach((child) => {
      handleOpenAllBookmarks(child);
    });
  }
}

export function openAllBookmarks(folder) {
  window.chrome.bookmarks.getSubTree(getElementData(folder, 'item-id'), (data) => {
    handleOpenAllBookmarks(data[0]);
    window.close();
  });
}

function contextAction(e, callback) {
  document.querySelector('#context').style.display = 'none';
  callback.call();
  return nothing(e);
}

function showContextMenu(offset) {
  const $context = $('#context');

  $context.css({
    left: -10000,
  }).show(); // draw offscreen for dimensions

  const windowHeight = $(window).height();
  const contextHeight = $context.height();
  const scrollTop = $('#wrapper').scrollTop();
  let topY = scrollTop + offset.y;
  const bottomY = scrollTop + windowHeight;
  if (topY > bottomY - contextHeight) {
    topY = bottomY - contextHeight - 15;
  }

  $context.css({
    left: offset.x,
    topY,
  });
}

export function showContextMenuFolder(folder, offset) {
  $('#context > li').off('mousedown').hide();
  $('#folder_open_all').show().one('mousedown', (subEvent) => {
    contextAction(subEvent, () => {
      openAllBookmarks(folder);
    });
  });
  $('#folder_delete').show().one('mousedown', (subEvent) => {
    contextAction(subEvent, () => {
      if (window.confirm('Are you sure you want to delete this folder?')) {
        window.chrome.bookmarks.removeTree(getElementData(folder, 'item-id'), () => {
          folder.parentNode.removeChild(folder);
        });
      }
    });
  });
  $('#folder_edit').show().one('mousedown', (subEvent) => {
    const animationDuration = parseInt(mbtSettings.get('animation_duration'), 10);
    const itemId = getElementData(folder, 'item-id');
    contextAction(subEvent, () => {
      $('#url_row').hide();
      $('#edit_name').val($('> span', $(folder)).text());
      $('#overlay').slideDown(animationDuration, () => {
        $('#edit_name').focus();
      });
      $('#edit_save').off('click').one('click', () => {
        window.chrome.bookmarks.update(itemId, {
          title: $('#edit_name').val(),
        });
        $('> span', $(folder)).text($('#edit_name').val());
        $('.selected').removeClass('selected');
        $('#overlay').slideUp(animationDuration);
      });
    });
  });
  addClass(folder, 'selected');
  showContextMenu(offset);
}

export function showContextMenuBookmark(bookmark, offset) {
  $('#context > li').off('mousedown').hide();
  $('#bookmark_delete').show().one('mousedown', (subEvent) => {
    contextAction(subEvent, () => {
      if (window.confirm('Are you sure you want to delete this bookmark?')) {
        window.chrome.bookmarks.remove(getElementData(bookmark, 'item-id'), () => {
          bookmark.remove();
        });
      }
    });
  });
  $('#bookmark_edit').show().one('mousedown', (subEvent) => {
    const animationDuration = parseInt(mbtSettings.get('animation_duration'), 10);
    const itemId = getElementData(bookmark, 'item-id');
    contextAction(subEvent, () => {
      $('#url_row').show();
      $('#edit_name').val($('> span', $(bookmark)).text()).focus();
      $('#edit_url').val(getElementData(bookmark, 'url'));
      $('#overlay').slideDown(animationDuration, () => {
        $('#edit_name').focus();
      });
      $('#edit_save').off('click').one('click', () => {
        window.chrome.bookmarks.update(itemId, {
          title: $('#edit_name').val(),
          url: $('#edit_url').val(),
        });
        $('> span', $(bookmark))
          .text($('#edit_name').val())
          .attr(
            'title',
            `${$('#edit_name').val()} [${$('#edit_url').val()}]`,
          );
        $('.selected').removeClass('selected');
        $('#overlay').slideUp(animationDuration);
      });
    });
  });
  addClass(bookmark, 'selected');
  showContextMenu(offset);
}
