/**
 * Highlight search string in search results
 */
function highlightSearch(needle, haystack) {
	var
		pos,
		needleLower=needle.toLowerCase(),
		haystackLower=haystack.toLowerCase().replace("'", '')
	;

	if (-1 == (pos=haystackLower.indexOf(needleLower))) {
		return haystack;
	}


	var
		before = haystack.substr(0, pos),
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
			suggestions.push({
				score: score,
				content: htmlEncode(loc.title),
				description: htmlEncode(highlightSearch(text, loc.title)) + ' - <url>' + htmlEncode(highlightSearch(text, loc.url)) + '</url>',
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
	}
	return false;
}

/**
 * Handler that is fired when the user changes the input
 */
chrome.omnibox.onInputChanged.addListener( function(text, suggest) {
	if (text.length === 0) {
		setDefaultSuggestion(_defaultDescription);
	}

	var suggestions = getSuggestions(data, text);

	if (suggestions.length) {
		var topSuggestion = suggestions.reverse().pop();
		setDefaultSuggestion(topSuggestion.description);
		if (suggestions.length) {
			suggestions.reverse();
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