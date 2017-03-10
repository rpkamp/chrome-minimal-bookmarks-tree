/* global chrome */
import { handleOpenAllBookmarks } from './functions';

/**
 * Hook into the chrome omnibox API to let people search
 * for bookmarks and bookmark folders.
 */
export default function () {
  let defaultSuggestionContent = '';
  const folderDescription = chrome.i18n.getMessage('omniboxFolderDescription');
  const defaultSuggestion = chrome.i18n.getMessage('omniboxDefaultSuggestion');

  function quoteAmpersands(text) {
    return text.replace(/&/g, '&amp;');
  }

  function setDefaultSuggestion(suggestion) {
    if (suggestion.description === '' && suggestion.description === '') {
      return;
    }
    if (suggestion.description === '') {
      suggestion.description = suggestion.content;
    }

    defaultSuggestionContent = suggestion.content;
    chrome.omnibox.setDefaultSuggestion({
      description: suggestion.description,
    });
  }

  function removeDefaultSuggestion() {
    defaultSuggestionContent = '';
    chrome.omnibox.setDefaultSuggestion({
      description: defaultSuggestion,
    });
  }

  function bookmarkOrFolderToSuggestion(bookmark) {
    if (bookmark.url) {
      return {
        description: quoteAmpersands(bookmark.title),
        content: bookmark.url,
      };
    }

    return {
      description: `${quoteAmpersands(bookmark.title)} (${folderDescription})`,
      content: `bmfolder:${bookmark.id}`,
    };
  }

  chrome.omnibox.onInputChanged.addListener((query, suggest) => {
    chrome.bookmarks.search(query, (bookmarksAndFolders) => {
      let suggestions = bookmarksAndFolders.map(
        bookmarkOrFolder => bookmarkOrFolderToSuggestion(bookmarkOrFolder),
      );

      removeDefaultSuggestion();
      if (suggestions.length > 0) {
        setDefaultSuggestion({
          description: suggestions[0].description,
          content: suggestions[0].content,
        });
        suggestions = suggestions.slice(1);
      }

      suggest(suggestions);
    });
  });

  chrome.omnibox.onInputEntered.addListener((input) => {
    if (/^https?:\/\//i.test(input)) {
      chrome.tabs.query({ active: true }, (tab) => {
        chrome.tabs.update(tab.id, { url: input });
      });
      return;
    }

    const inputMatches = input.match(/^bmfolder:(\d+)$/);
    if (inputMatches) {
      chrome.bookmarks.getSubTree(inputMatches[1], (data) => {
        handleOpenAllBookmarks(data[0]);
      });
    }

    if (defaultSuggestionContent === '') {
      return;
    }

    if (/^https?:\/\//i.test(defaultSuggestionContent)) {
      chrome.tabs.query({ active: true }, (tab) => {
        chrome.tabs.update(tab.id, { url: input });
      });
      return;
    }

    const defaultSuggestionMatches = defaultSuggestionContent.match(/^bmfolder:(\d+)$/);
    if (defaultSuggestionMatches) {
      chrome.bookmarks.getSubTree(defaultSuggestionMatches[1], (data) => {
        handleOpenAllBookmarks(data[0]);
      });
    }
  });

  chrome.omnibox.onInputStarted.addListener(() => {
    removeDefaultSuggestion();
  });

  chrome.omnibox.onInputCancelled.addListener(() => {
    removeDefaultSuggestion();
  });
}
