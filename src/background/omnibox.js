/* global window */
import { handleOpenAllBookmarks } from '../common/functions';

/**
 * Hook into the chrome omnibox API to let people search
 * for bookmarks and bookmark folders.
 */
export default function () {
  let defaultSuggestionContent = '';
  const folderDescription = window.chrome.i18n.getMessage('omniboxFolderDescription');
  const defaultSuggestion = window.chrome.i18n.getMessage('omniboxDefaultSuggestion');

  function setDefaultSuggestion(suggestion) {
    if (suggestion.description === '' && suggestion.description === '') {
      return;
    }

    if (suggestion.description === '') {
      suggestion.description = suggestion.content;
    }

    defaultSuggestionContent = suggestion.content;
    window.chrome.omnibox.setDefaultSuggestion({
      description: suggestion.description,
    });
  }

  function removeDefaultSuggestion() {
    defaultSuggestionContent = '';
    window.chrome.omnibox.setDefaultSuggestion({
      description: defaultSuggestion,
    });
  }

  function quoteAmpersands(text) {
    return text.replace(/&/g, '&amp;');
  }

  function createHighlighter(searchTerm) {
    const expression = new RegExp(`(${searchTerm.replace(/([.?*+^$[\]\\(){}|-])/g, '$1')})`, 'gi');
    return haystack => haystack.replace(expression, '<match>$1</match>');
  }

  function bookmarkOrFolderToSuggestion(bookmark, highlighter) {
    if (bookmark.url) {
      return {
        description: `${quoteAmpersands(highlighter(bookmark.title))} <url>${quoteAmpersands(bookmark.url)}</url>`,
        content: bookmark.url,
      };
    }

    return {
      description: `${quoteAmpersands(highlighter(bookmark.title))} <dim>(${quoteAmpersands(folderDescription)})</dim>`,
      content: `bmfolder:${bookmark.id}`,
    };
  }

  function handleOmniboxInputEntered(input) {
    if (input === '') {
      return;
    }

    if (/^https?:\/\//i.test(input)) {
      window.chrome.tabs.query({ active: true }, (tab) => {
        window.chrome.tabs.update(tab.id, { url: input });
      });
      return;
    }

    const matches = input.match(/^bmfolder:(\d+)$/);
    if (matches) {
      window.chrome.bookmarks.getSubTree(matches[1], (data) => {
        handleOpenAllBookmarks(data[0], false);
      });
      return;
    }

    throw new Error('Unable to handle input as it does not start with http://, https:// or bmfolder:');
  }

  window.chrome.omnibox.onInputChanged.addListener((input, suggest) => {
    window.chrome.bookmarks.search(input, (bookmarksAndFolders) => {
      const highlighter = createHighlighter(input);
      const suggestions = bookmarksAndFolders.map(
        bookmarkOrFolder => bookmarkOrFolderToSuggestion(bookmarkOrFolder, highlighter),
      );

      removeDefaultSuggestion();
      if (suggestions.length > 0) {
        setDefaultSuggestion({
          description: suggestions[0].description,
          content: suggestions[0].content,
        });
        suggest(suggestions.slice(1));
      }
    });
  });

  window.chrome.omnibox.onInputEntered.addListener((input) => {
    try {
      handleOmniboxInputEntered(input);
      return;
    } catch (e) {
      // ignore error, see if the default suggestions
      // will trigger anything
    }

    try {
      handleOmniboxInputEntered(defaultSuggestionContent);
    } catch (e) {
      // ignore error
    }
  });
}
