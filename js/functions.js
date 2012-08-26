var closeOldFolder = Settings.get('close_old_folder');
if (!closeOldFolder) {
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
						.data('url', child.url)
						.append(
								$('<span>', {
										text: child.title,
										title: child.title + ' [' + child.url + ']'
								}).css({
										'background-image': 'url("chrome://favicon/' + child.url + '")',
										'background-repeat': 'no-repeat'
								})
						)
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
		$('#wrapper').css('overflow-y', 'hidden');
		if (closeOldFolder) {
				if (elem.parents('.folder.open').length) {
						$('.folder.open', elem.parent()).not(elem).removeClass('open').find('.sub').slideUp('fast');
				} else {
						$('.folder.open').not(elem).removeClass('open').find('.sub').slideUp('fast');
				}
		}
		elem.toggleClass('open');
		elem.children('.sub').eq(0).slideToggle('fast', function() {
				$('#wrapper').css('overflow-y', 'auto');
				if (!closeOldFolder) {
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
						chrome.tabs.create({url: $(this).data('url')});
				});
		} else {
				$(folder).children('ul').eq(0).children('li:not(.folder)').each(function() {
						chrome.tabs.create({url: $(this).data('url')});
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
				'top': $('#wrapper').get(0).scrollTop + e.pageY
		}).show();
}
