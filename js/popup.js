$(document).bind('contextmenu', function(e) {
		return false;
});

chrome.bookmarks.getTree(function(x) {
		var y = jQuery.extend(true, {}, x[0]);
		delete y.children[1];
		$("#wrapper").append(buildTree(y));
		$('#wrapper').append(buildTree(x[0].children[1]));
		$('#loading').remove();
		$('#wrapper').on('mousedown', 'li', function(e) {
				$('#context').hide();
				$('.selected').removeClass('selected');
				var $this = $(this);
				if ($this.hasClass('folder')) {
						if (e.button == 0) {
								toggleFolder($this);
						} else if (e.button == 2) {
								showContextMenuFolder($this, e);
						}
				} else {
						var url = $this.data('url');
						if (e.button == 0) {
								if (e.metaKey || e.ctrlKey) {
										chrome.tabs.create({url: url, active: false});
								} else {
										chrome.tabs.getSelected(null, function(tab) {
												chrome.tabs.update(tab.id, {url: url});
												window.close();
										});
								}
						} else if (e.button == 1) {
								chrome.tabs.create({url: url});
						}
				}
				e.preventDefault();
				e.stopPropagation();
				return false;
		});
});