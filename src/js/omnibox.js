/**
 * Highlight search string in search results
 */
function highlightSearch(needle, haystack) {
  const needleLower = needle.toLowerCase();
  const haystackLower = haystack.toLowerCase().replace("'", '');

  const pos = haystackLower.indexOf(needleLower);
  if (pos === -1) {
    return haystack;
  }

  return `${haystack.substr(0, pos)}
    <match>
    ${haystack.substr(pos, needle.length)}
    </match>
    ${haystack.substr(pos + needle.length)}`;
}

/**
 * Show a default suggestion in the omnibox when a user types in 'spf'
 */
function setDefaultSuggestion(description) {
  window.chrome.omnibox.setDefaultSuggestion({
    description,
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
  const suggestions = [];
  let loc;
  for (loc of data) {
    const score = loc.title.score(text) * 1.5 + loc.url.score(text);
    if (score <= 0) {
      continue;
    }
    let urlText = '';
    if (String(loc.url).match(/^https?:\/\//)) {
      urlText = `<url>${htmlEncode(highlightSearch(text, loc.url))}</url>`;
    }
    suggestions.push({
      score,
      content: htmlEncode(loc.title),
      description: `${htmlEncode(highlightSearch(text, loc.title))} ${urlText}`,
      url: loc.url,
    });
  }

  suggestions.sort((a, b) => {
    return b.score - a.score === 0 ? b.content.length - a.content.length : b.score - a.score;
  });

  return suggestions;
}

/**
 * Get URL for the top suggestion
 */
function getTopSuggestionUrl(data, text) {
  const suggestions = getSuggestions(data, text);
  if (suggestions.length) {
    const topSuggestion = suggestions.reverse().pop();
    return topSuggestion.url;
  } else if (String(text).match(/^https?:\/\//)) {
    return text;
  }
  return false;
}

/**
 * Handler that is fired when the user changes the input
 */
window.chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  if (text.length === 0) {
    setDefaultSuggestion(window.chrome.i18n.getMessage('omnibarDefaultSuggestion'));
  }
  if (!dataLoaded) {
    loadData();
  }

  let suggestions = getSuggestions(data, text);

  if (suggestions.length) {
    const topSuggestion = suggestions.reverse().pop();
    setDefaultSuggestion(topSuggestion.description);
    if (suggestions.length) {
      suggestions.reverse();
      suggestions.forEach((suggestion) => {
        if (suggestion.content === '') {
          suggestion.content = suggestion.url;
        }
        delete(suggestion.score);
        delete(suggestion.url);
      });
      suggest(suggestions);
    }
  }
});

/**
 * Handler that is fired when the user accepts a suggestion
 */
window.chrome.omnibox.onInputEntered.addListener((text) => {
  window.chrome.tabs.query({ active: true }, (tabs) => {
    const url = getTopSuggestionUrl(data, text);
    if (url !== false) {
      window.chrome.tabs.update(tabs[0].id, { url });
    }
  });
});

/**
 * Bookmark or folder added. If a bookmark was added, add it
 * to our search information. If a folder was added, ignore.
 */
window.chrome.bookmarks.onCreated.addListener((id, node) => {
  if (dataLoaded && node.url) {
    data.push(node);
  }
});

/**
 * Bookmark or folder removed - reload all bookmarks
 * Not the most elegant way - but better than bloating the
 * data structure that holds alls the bookmark info
 */
window.chrome.bookmarks.onRemoved.addListener(() => {
  if (dataLoaded) {
    loadData();
  }
});

/**
 * Bookmark or folder updated
 */
window.chrome.bookmarks.onChanged.addListener((id, changeInfo) => {
  if (!dataLoaded) {
    return;
  }
  let node;
  for (node of data) {
    if (node.id === id) {
      node.title = changeInfo.title;
      node.url = changeInfo.url;
    }
  }
});
