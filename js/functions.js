var openFolders = localStorage.getItem('openfolders');
if (openFolders) {
		openFolders = JSON.parse(openFolders);
} else {
		openFolders = [];
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
						d
						.append($('<span>', {text: child.title, title: child.url}).css({'background-image': 'url("chrome://favicon/' + child.url + '")', 'background-repeat': 'no-repeat'}))
						.data('url', child.url)
				} else { // folder
						d
						.addClass('folder' + (isOpen ? ' open' : ''))	
						.append($('<span>', {text: child.title}))
						.data('folder-id', child.id);
				}
				
				if (child.children) {
						children = buildTree(child, level + 1, isOpen);
						d.append(children);
				}
				wrapper.append(d);
		}
		return wrapper;
}

function toggleFolder(elem) {
		elem.toggleClass('open');
		$('#wrapper').css('overflow-y', 'hidden');
		elem.children('.sub').eq(0).slideToggle('fast', function() {
				$('#wrapper').css('overflow-y', 'auto');
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
		});
}

function _openAllBookmarks(folder) {
		$('li:not(.folder)', folder).each(function() {
				chrome.tabs.create({url: $(this).data('url')});
		});
}

function openAllBookmarks(folder, e) {
		$('#context').hide();
		_openAllBookmarks(folder);
		e.preventDefault();
		e.stopPropagation();
		return false;
		window.close();
}

function showContextMenu(elem, e) {
		$(elem).addClass('selected');
		$("#context").css({
				'left': e.pageX,
				'top': $('#wrapper').get(0).scrollTop + e.pageY
		}).show();
}

function showContextMenuFolder(folder, e) {
		$('#context > li').off('mousedown').hide();
		$('#context [id^="folder_open_all"]').show();
		$('#folder_open_all').one('mousedown', function(e) {
				openAllBookmarks(folder, e);
		});
		showContextMenu(folder, e);
}

function showContextMenuBookmark(bookmark, e) {
		return;
		$('#context > li').hide();
		$('#context [id^="bookmark"]').show();
		showContextMenu(bookmark, e);
}