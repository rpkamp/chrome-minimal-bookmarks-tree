import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import SuggestResult = chrome.omnibox.SuggestResult;
import Suggestion = chrome.omnibox.Suggestion;
import {BookmarkOpener, BookmarkOpeningDisposition} from "../common/BookmarkOpener";

/**
 * Hook into the chrome omnibox API to let people search
 * for bookmarks and bookmark folders.
 */
export default function () {
  let currentDefaultSuggestion: SuggestResult | null = null;
  const folderDescription: string = chrome.i18n.getMessage('omniboxFolderDescription');
  const defaultSuggestion: Suggestion = {
    description: chrome.i18n.getMessage('omniboxDefaultSuggestion')
  };

  function setDefaultSuggestion(suggestion: SuggestResult): void {
    if (suggestion.description === '') {
      return;
    }

    currentDefaultSuggestion = suggestion;
    chrome.omnibox.setDefaultSuggestion({
      description: suggestion.description
    });
  }

  function removeDefaultSuggestion(): void {
    currentDefaultSuggestion = null;
    chrome.omnibox.setDefaultSuggestion(defaultSuggestion);
  }

  function createHighlighter(searchTerm: string): Function {
    const expression = new RegExp(`(${searchTerm.replace(/([.?*+^$[\]\\(){}|-])/g, '$1')})`, 'gi');

    return haystack => haystack.replace(expression, '<match>$1</match>');
  }

  function createSuggestionResult(bookmark: BookmarkTreeNode, highlighter: Function): SuggestResult {
    const quoteAmpersands = text => text.replace(/&/g, '&amp;');

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

  function handleOmniboxInputEntered(suggestionContent: string): Promise<boolean> {
    return new Promise((resolve: Function, reject: Function) => {
      if (suggestionContent === '') {
        reject();
      }

      if (/^https?:\/\//i.test(suggestionContent)) {
        BookmarkOpener.open(suggestionContent, BookmarkOpeningDisposition.activeTab);
        resolve(true);
        return;
      }

      const matches = suggestionContent.match(/^bmfolder:(\d+)$/);
      if (matches) {
        chrome.bookmarks.getSubTree(matches[1], (data: BookmarkTreeNode[]) => {
          BookmarkOpener.openAll(data[0], false);
          resolve(true);
        });
        return;
      }

      reject();
    });
  }

  chrome.omnibox.onInputChanged.addListener((input: string, suggest: Function) => {
    chrome.bookmarks.search(input, (bookmarksAndFolders: BookmarkTreeNode[]) => {
      const highlighter = createHighlighter(input);
      const suggestions = bookmarksAndFolders.map(
        bookmarkOrFolder => createSuggestionResult(bookmarkOrFolder, highlighter),
      );

      removeDefaultSuggestion();
      if (suggestions.length > 0) {
        setDefaultSuggestion(suggestions[0]);
        suggest(suggestions.slice(1));
      }
    });
  });

  chrome.omnibox.onInputEntered.addListener((suggestionContent: string) => {
    handleOmniboxInputEntered(suggestionContent)
      .catch(() => {
        if (null === currentDefaultSuggestion) {
          return;
        }

        handleOmniboxInputEntered(currentDefaultSuggestion.content)
      });
  });
}
