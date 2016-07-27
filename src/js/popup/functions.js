function nothing(e) {
  e = e || window.event;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  return false;
}

var openFoldersDirty = false;

function addOpenFolder(id) {
  if ($.inArray(id, openFolders) == -1) {
    openFolders.push(id);
    openFoldersDirty = true;
  }
}

function removeOpenFolder(id) {
  while ((pos = $.inArray(id, openFolders)) != -1) {
    openFoldersDirty = true;
    openFolders.splice(pos, 1);
  }
}

function saveOpenFolders() {
  if (openFoldersDirty) {
    localStorage.setItem('openfolders', JSON.stringify(openFolders));
    openFoldersDirty = false;
  }
}

function setWidthHeight(tab, preferredWidth, preferredHeight, zoom) {
  var scale = 1 / (zoom / 100);

  var max_w = scale * (tab.width - 100);
  var settings_w = scale * preferredWidth;
  var final_w = Math.min(max_w, settings_w);

  var max_h = scale * (tab.height - 100);
  var settings_h = scale * preferredHeight;
  var final_h = Math.min(scale * 600, Math.min(max_h, settings_h));

  $('#wrapper').css('max-width', final_w + 'px').css('min-width', final_w + 'px').width(final_w);
  $('#wrapper').css('max-height', final_h + 'px');
}

var openFolders = localStorage.getItem('openfolders');
if (openFolders) {
  openFolders = JSON.parse(openFolders);
} else {
  openFolders = [];
}

function buildTree(treeNode, level, visible, forceRecursive) {
  level = level || 1;
  var wrapper, fragmentWrapper = false;

  if (typeof forceRecursive === 'undefined') {
    forceRecursive = false;
  }

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

  var child, d, children, isOpen;
  for (var c in treeNode.children) {
    child = treeNode.children[c];
    isOpen = $.inArray(child.id, openFolders) != -1;
    d = $('<li>');

    if (child.url) { // url
      d.data('url', child.url)
        .data('item-id', child.id)
        .append(
          $('<span>', {
            text: child.title,
            title: child.title + ' [' + child.url + ']'
          }).css({
            'background-image': 'url("chrome://favicon/' + child.url + '")',
            'background-repeat': 'no-repeat'
          }).data({
            url: child.url
          })
        );
    } else { // folder
      d.addClass('folder' + (isOpen ? ' open' : ''))
        .append($('<span>', { text: child.title }));

      if (MBT_settings.get('hide_empty_folders') && child.children && !child.children.length) {
        // we need to add hidden nodes for these
        // otherwise sorting doesn't work properly
        d.addClass('hidden');
      } else {
        d.data('item-id', child.id)
          .data('level', level)
          .attr('id', 'tree' + child.id);

        if (child.children && child.children.length) {
          var loaded = isOpen;
          if (isOpen || forceRecursive) {
            children = buildTree(child, level + 1, isOpen);
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

function toggleFolder(elem) {
  var animationDuration = parseInt(MBT_settings.get('animation_duration'), 10);
  $('#wrapper').css('overflow-y', 'hidden');
  if (MBT_settings.get('close_old_folder')) {
    if (elem.parents('.folder.open').length) {
      $('.folder.open', elem.parent()).not(elem).removeClass('open').find('.sub').stop().slideUp(animationDuration);
    } else {
      $('.folder.open').not(elem).removeClass('open').find('.sub').stop().slideUp(animationDuration);
    }
  }

  if (!elem.data('loaded')) {
    chrome.bookmarks.getSubTree(elem.data('item-id'), function (data) {
      var t = buildTree(data[0], elem.data('level') + 1);
      elem.append(t);
      elem.data('loaded', true);
      _handleToggle(elem);
    });
  } else {
    _handleToggle(elem);
  }
}

function _handleToggle(elem) {
  var animationDuration = parseInt(MBT_settings.get('animation_duration'), 10);

  elem.toggleClass('open');
  elem.children('.sub').eq(0).stop().slideToggle(animationDuration, function () {
    $('#wrapper').css('overflow-y', 'auto');
    var id = $(this).parent().data('item-id');
    if (!MBT_settings.get('close_old_folder')) {
      if (!$(this).is(':visible')) {
        removeOpenFolder(id);
        $(this).find('li').each(function () {
          removeOpenFolder($(this).data('item-id'));
          $(this).removeClass('open');
          $('.sub', this).hide();
        });
      } else {
        addOpenFolder(id);
      }
    } else {
      if ($(this).is(':visible')) {
        openFolders = [id];
      } else {
        openFolders = [];
      }
      var parents = elem.parents('.folder.open');
      $(parents).each(function () {
        addOpenFolder($(this).data('item-id'));
      });
    }
    if (MBT_settings.get('remember_scroll_position')) {
      localStorage.setItem('scrolltop', $('#wrapper').scrollTop());
    }
    saveOpenFolders();
  });
}

function _openAllBookmarks(folder) {
  chrome.bookmarks.getSubTree(folder.data('item-id'), function (data) {
    _handleOpenAllBookmarks(data[0]);
    window.close();
  });
}

function _handleOpenAllBookmarks(data) {
  console.log(data);
  if (data.url) {
    chrome.tabs.create({ url: data.url, active: false });
  } else if (data.children) {
    for (var j in data.children) {
      _handleOpenAllBookmarks(data.children[j]);
    }
  }
}

function contextAction(e, callback) {
  $('#context').hide();
  callback.call();
  return nothing(e);
}

function showContextMenuFolder(folder, e) {
  $('#context > li').off('mousedown').hide();
  $('#folder_open_all').show().one('mousedown', function (e) {
    contextAction(e, function () {
      _openAllBookmarks(folder);
    });
  });
  $('#folder_delete').show().one('mousedown', function (e) {
    contextAction(e, function () {
      if (confirm('Are you sure you want to delete this folder?')) {
        chrome.bookmarks.removeTree(folder.data('item-id'), function () {
          folder.remove();
        });
      }
    });
  });
  $('#folder_edit').show().one('mousedown', function (e) {
    var animationDuration = parseInt(MBT_settings.get('animation_duration'), 10);
    var item_id = folder.data('item-id');
    contextAction(e, function () {
      $('#url_row').hide();
      $('#edit_name').val($('> span', folder).text());
      $('#overlay').slideDown(animationDuration, function () {
        $('#edit_name').focus();
      });
      $('#edit_save').off('click').one('click', function () {
        chrome.bookmarks.update(item_id, {
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

function showContextMenuBookmark(bookmark, e) {
  $('#context > li').off('mousedown').hide();
  $('#bookmark_delete').show().one('mousedown', function (e) {
    contextAction(e, function () {
      if (confirm('Are you sure you want to delete this bookmark?')) {
        chrome.bookmarks.remove(bookmark.data('item-id'), function () {
          bookmark.remove();
        });
      }
    });
  });
  $('#bookmark_edit').show().one('mousedown', function (e) {
    var animationDuration = parseInt(MBT_settings.get('animation_duration'), 10);
    var item_id = bookmark.data('item-id');
    contextAction(e, function () {
      $('#url_row').show();
      $('#edit_name').val($('> span', bookmark).text()).focus();
      $('#edit_url').val($(bookmark).data('url'));
      $('#overlay').slideDown(animationDuration, function () {
        $('#edit_name').focus();
      });
      $('#edit_save').off('click').one('click', function () {
        chrome.bookmarks.update(item_id, {
          title: $('#edit_name').val(),
          url: $('#edit_url').val(),
        });
        $('> span', bookmark).text($('#edit_name').val()).attr('title', $('#edit_name').val() + ' [' + $('#edit_url').val() + ']');
        $('.selected').removeClass('selected');
        $('#overlay').slideUp(animationDuration);
      });
    });
  });
  $(bookmark).addClass('selected');
  showContextMenu(e);
}

function showContextMenu(e) {
  var $context = $("#context");

  $context.css({
    'left': -10000
  }).show(); // draw offscreen for dimensions

  var windowHeight = $(window).height();
  var contextHeight = $context.height();
  var scrollTop = $('#wrapper').scrollTop();
  var top = scrollTop + e.pageY;
  if (top > scrollTop + windowHeight - contextHeight) {
    top = scrollTop + windowHeight - contextHeight - 15;
  }

  $context.css({
    'left': e.pageX,
    'top': top
  });
}
