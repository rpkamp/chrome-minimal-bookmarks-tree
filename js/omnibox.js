/**
 * Highlight search string in search results
 */
function highlightSearch(needle, haystack) {
	var	pos,
		needleLower=needle.toLowerCase(),
		haystackLower=haystack.toLowerCase().replace("'", '')
		;

	if (-1 === (pos=haystackLower.indexOf(needleLower))) {
		return haystack;
	}

	var	before = haystack.substr(0, pos),
		inner  = haystack.substr(pos, needle.length),
		after  = haystack.substr(pos+needle.length)
		;

	return before + '<match>' + inner + '</match>' + after;
}

/**
 * Show a default suggestion in the omnibox when a user types in 'spf'
 */
function setDefaultSuggestion(description) {
	chrome.omnibox.setDefaultSuggestion({
		description: description
	});
}

/**
 * HTMl encode
 */
function htmlEncode(text) {
	return text.replace(/&/g, '&amp;');
}

/**
 * Generate suggestions based on data and text
 */
function getSuggestions(data, text) {
	var suggestions=[], score, loc;
	for (var d in data) {
		loc = data[d];
		if (0 !== (score = loc.title.score(text) * 1.5 + loc.url.score(text))) {
			var urlText = '';
			if (String(loc.url).match(/^https?:\/\//)) {
				urlText = ' <url>' + htmlEncode(highlightSearch(text, loc.url)) + '</url>';
			}
			suggestions.push({
				score: score,
				content: htmlEncode(loc.title),
				description: htmlEncode(highlightSearch(text, loc.title)) + urlText,
				url: loc.url
			});
		}
	}

	suggestions.sort(function(a, b) {
		return b.score - a.score === 0 ? b.content.length - a.content.length : b.score - a.score;
	});

	return suggestions;
}

/**
 * Get URL for the top suggestion
 */
function getTopSuggestionUrl(data, text) {
	var suggestions = getSuggestions(data, text);
	if (suggestions.length) {
		var topSuggestion = suggestions.reverse().pop();
		return topSuggestion.url;
	} else if (String(text).match(/^https?:\/\//)) {
        return text;
    }
	return false;
}

/**
 * Handler that is fired when the user changes the input
 */
chrome.omnibox.onInputChanged.addListener( function(text, suggest) {
	if (text.length === 0) {
		setDefaultSuggestion(chrome.i18n.getMessage("omnibarDefaultSuggestion"));
	}
	if (!dataLoaded) {
		loadData();
	}

	var suggestions = getSuggestions(data, text);

	if (suggestions.length) {
		var topSuggestion = suggestions.reverse().pop();
		setDefaultSuggestion(topSuggestion.description);
		if (suggestions.length) {
			suggestions.reverse();
            suggestions.forEach(function(a) {
                if (a.content === "") {
                    a.content = a.url;
                }
                delete(a.score);
                delete(a.url);
            });
			suggest(suggestions);
		}
	}
});

/**
 * Handler that is fired when the user accepts a suggestion
 */
chrome.omnibox.onInputEntered.addListener( function(text) {
	chrome.tabs.getSelected(null, function(tab) {
		var url = getTopSuggestionUrl(data, text);
		if (false !== url) {
			chrome.tabs.update(tab.id, {url: url});
		}
	});
});

/**
 * Bookmark or folder added. If a bookmark was added, add it
 * to our search information. If a folder was added, ignore.
 */
chrome.bookmarks.onCreated.addListener(function(id, node) {
	if (dataLoaded && node.url) {
		data.push(node);
	}
});

/**
 * Bookmark or folder removed - reload all bookmarks
 * Not the most elegant way - but better than bloating the
 * data structure that holds alls the bookmark info
 */
chrome.bookmarks.onRemoved.addListener(function(removeId, removeInfo) {
	if (dataLoaded) {
		loadData();
	}
});

/**
 * Bookmark or folder updated
 */
chrome.bookmarks.onChanged.addListener(function(id, changeInfo) {
	if (!dataLoaded) {
		return;
	}
	for (var d in data) {
		var node = data[d];
		if (node.id === id) {
			node.title = changeInfo.title;
			node.url = changeInfo.url;
		}
	}
});
