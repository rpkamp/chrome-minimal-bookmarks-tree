function nothing(e) {
    e = e || window.event;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return false;
}

function addOpenFolder(id) {
    if ($.inArray(id, openFolders) == -1) {
        openFolders.push(id);
        saveOpenFolders();
    }
}

function removeOpenFolder(id) {
    while ((pos = $.inArray(id, openFolders)) != -1) {
        openFolders.splice(pos, 1);
    }
    saveOpenFolders();
}

function saveOpenFolders() {
    localStorage.setItem('openfolders', JSON.stringify(openFolders));
}

function setWidthHeight(win) {
    var scale = 1 / (parseInt(Settings.get('zoom'), 10) / 100);

    var max_w = scale * (win.width - 100);
    var settings_w = scale * parseInt(Settings.get('width'), 10);
    var final_w = Math.min(max_w, settings_w);

    var max_h = scale * (win.height - 100);
    var settings_h = scale * parseInt(Settings.get('height'), 10);
    var final_h = Math.min(scale * 600, Math.min(max_h, settings_h));

    $('#wrapper').css('max-width', final_w + 'px').css('min-width', final_w + 'px').width(final_w);
    $('#wrapper').css('max-height', final_h + 'px');
}

if (!Settings.get('close_old_folder')) {
    var openFolders = localStorage.getItem('openfolders');
    if (openFolders) {
        openFolders = JSON.parse(openFolders);
    } else {
        openFolders = [];
    }
}

function buildTree(treeNode, level, visible) {
    level = level || 1;
    var wrapper, fragmentWrapper = false;

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
                    title: child.title + ' (' + child.index + ')' + ' [' + child.url + ']'
                }).css({
                    'background-image': 'url("chrome://favicon/' + child.url + '")',
                    'background-repeat': 'no-repeat'
                })
            );
        } else { // folder
            if (Settings.get('hide_empty_folders') && child.children && !child.children.length) {
                continue;
            }
            d.addClass('folder' + (isOpen ? ' open' : ''))
             .append($('<span>', { text: child.title }))
             .data('item-id', child.id);

            if (child.children && child.children.length) {
                children = buildTree(child, level + 1, isOpen);
                d.append(children);
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
    var animationDuration = parseInt(Settings.get('animation_duration'), 10);
    $('#wrapper').css('overflow-y', 'hidden');
    if (Settings.get('close_old_folder')) {
        if (elem.parents('.folder.open').length) {
            $('.folder.open', elem.parent()).not(elem).removeClass('open').find('.sub').slideUp(animationDuration);
        } else {
            $('.folder.open').not(elem).removeClass('open').find('.sub').slideUp(animationDuration);
        }
    }
    elem.toggleClass('open');
    elem.children('.sub').eq(0).slideToggle(animationDuration, function() {
        $('#wrapper').css('overflow-y', 'auto');
        if (!Settings.get('close_old_folder')) {
            var id = $(this).parent().data('item-id');
            if (!$(this).is(':visible')) {
                removeOpenFolder(id);
                $(this).find('li').each( function () {
                    removeOpenFolder($(this).data('item-id'));
                    $(this).removeClass('open');
                    $('.sub', this).hide();
                });
            } else {
                addOpenFolder(id);
            }
        }
    });
}

function _openAllBookmarks(folder) {
    if (Settings.get('open_all_sub')) {
        $('li:not(.folder)', folder).each(function() {
            chrome.tabs.create({
                url: $(this).data('url')
            });
        });
    } else {
        $(folder).children('ul').eq(0).children('li:not(.folder)').each(function() {
            chrome.tabs.create({
                url: $(this).data('url')
            });
        });
    }
}

function contextAction(e, callback) {
    $('#context').hide();
    callback.call();
    return nothing(e);
}

function showContextMenuFolder(folder, e) {
    $('#context > li').off('mousedown').hide();
    $('#folder_open_all').show().one('mousedown', function(e) {
        contextAction(e, function() { _openAllBookmarks(folder); });
    });
    $('#folder_delete').show().one('mousedown', function(e) {
        contextAction(e, function() {
            chrome.bookmarks.removeTree(folder.data('item-id'), function() {
                folder.remove();
            });
        });
    });
    $(folder).addClass('selected');
    showContextMenu(e);
}

function showContextMenuBookmark(bookmark, e) {
    $('#context > li').off('mousedown').hide();
    $('#bookmark_delete').show().one('mousedown', function(e) {
        contextAction(e, function() {
            chrome.bookmarks.remove(bookmark.data('item-id'), function() {
                bookmark.remove();
            });
        });
    });
    $(bookmark).addClass('selected');
    showContextMenu(e);
}

function showContextMenu(e) {
    $("#context").css({
        'left': -10000
    }).show(); // draw offscreen for dimensions
    var h = $('#context').height();

    var wrap = $('#wrapper');
    var top = wrap[0].scrollTop + e.pageY;
    if (top + h > wrap.height()) {
        top = wrap.height() - h - 15;
    }

    $("#context").css({
        'left': e.pageX,
        'top': top
    });
}
