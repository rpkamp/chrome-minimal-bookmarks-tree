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
    var wrapper;

    wrapper = $('<ul>');
    if (level > 1) {
        wrapper.addClass('sub');
        if (visible) {
            wrapper.show();
        }
    }

    var child, d, children, isOpen;
    for (var c in treeNode.children) {
        child = treeNode.children[c];
        isOpen = $.inArray(child.id, openFolders) != -1;
        d = $('<li>');

        if (child.url) { // url
            d.data('url', child.url)
             .append(
                $('<span>', {
                    text: child.title,
                    title: child.title + ' [' + child.url + ']'
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
             .data('folder-id', child.id);

            if (child.children && child.children.length) {
                children = buildTree(child, level + 1, isOpen);
                d.append(children);
            }
        }
        wrapper.append(d);
    }
    if ($('li', wrapper).length === 0) {
        return;
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
            $$this = $(this);
            var id = $$this.parent().data('folder-id');
            if (!$$this.is(':visible')) {
                removeOpenFolder(id);
                $$this.find('li').each( function () {
                    $$$this = $(this);
                    removeOpenFolder($$$this.data('folder-id'));
                    $$$this.removeClass('open');
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

function openAllBookmarks(folder, e) {
    $('#context').hide();
    _openAllBookmarks(folder);
    e.preventDefault();
    e.stopPropagation();
    return false;
}

function showContextMenuFolder(folder, e) {
    $('#context > li').off('mousedown').hide();
    $('#folder_open_all').show().one('mousedown', function(e) {
        openAllBookmarks(folder, e);
    });
    $(folder).addClass('selected');
    $("#context").css({
        'left': e.pageX,
        'top': $('#wrapper')[0].scrollTop + e.pageY
    }).show();
}
