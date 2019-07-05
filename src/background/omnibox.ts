import { handleOpenAllBookmarks } from '../common/functions';
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import SuggestResult = chrome.omnibox.SuggestResult;

/**
 * Hook into the chrome omnibox API to let people search
 * for bookmarks and bookmark folders.
 */
export default function () {
  let defaultSuggestionContent: string = '';
  const folderDescription: string = window.chrome.i18n.getMessage('omniboxFolderDescription');
  const defaultSuggestion: string = window.chrome.i18n.getMessage('omniboxDefaultSuggestion');

  function setDefaultSuggestion(suggestion): void {
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

  function removeDefaultSuggestion(): void {
    defaultSuggestionContent = '';
    window.chrome.omnibox.setDefaultSuggestion({
      description: defaultSuggestion,
    });
  }

  function quoteAmpersands(text: string): string {
    return text.replace(/&/g, '&amp;');
  }

  function createHighlighter(searchTerm: string): Function {
    const expression = new RegExp(`(${searchTerm.replace(/([.?*+^$[\]\\(){}|-])/g, '$1')})`, 'gi');

    return haystack => haystack.replace(expression, '<match>$1</match>');
  }

  function bookmarkOrFolderToSuggestion(bookmark: BookmarkTreeNode, highlighter: Function): SuggestResult {
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

  function handleOmniboxInputEntered(input: string): void {
    if (input === '') {
      return;
    }

    if (/^https?:\/\//i.test(input)) {
      window.chrome.tabs.query({ active: true }, (tab) => {
        if (typeof tab[0] === 'undefined' || typeof tab[0].id === 'undefined') {
          return;
        }

        window.chrome.tabs.update(tab[0].id, { url: input });
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

  window.chrome.omnibox.onInputChanged.addListener((input: string, suggest: Function) => {
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

  window.chrome.omnibox.onInputEntered.addListener((input: string) => {
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
