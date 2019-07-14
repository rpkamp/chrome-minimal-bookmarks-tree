import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import SuggestResult = chrome.omnibox.SuggestResult;
import Suggestion = chrome.omnibox.Suggestion;
import {BookmarkOpener, BookmarkOpeningDisposition} from "../common/BookmarkOpener";
import {Translator} from "../common/Translator";

export class OmniboxSuggester {
  private readonly folderDescription: string;
  private readonly defaultSuggestion: Suggestion;
  private translator: Translator;
  private currentDefaultSuggestion: SuggestResult | null = null;

  constructor(translator: Translator) {
    this.translator = translator;
    this.folderDescription = translator.translate('omniboxFolderDescription');
    this.defaultSuggestion = {
      description: translator.translate('omniboxDefaultSuggestion')
    };
  }

  suggest(input: string, bookmarksAndFolders: BookmarkTreeNode[], suggest: Function) {
    const highlighter = OmniboxSuggester.createHighlighter(input);
    const suggestions = bookmarksAndFolders.map(
      bookmarkOrFolder => this.createSuggestionResult(bookmarkOrFolder, highlighter),
    );

    this.removeDefaultSuggestion();
    if (suggestions.length == 0) {
      return;
    }

    this.setDefaultSuggestion(suggestions[0]);
    suggest(suggestions.slice(1));
  }

  handle(suggestionContent: string) {
    this.attemptHandle(suggestionContent)
      .catch(() => {
        if (null === this.currentDefaultSuggestion) {
          return;
        }

        this.attemptHandle(this.currentDefaultSuggestion.content)
      });
  }

  private setDefaultSuggestion(suggestion: SuggestResult): void {
    if (suggestion.description === '') {
      return;
    }

    this.currentDefaultSuggestion = suggestion;
    chrome.omnibox.setDefaultSuggestion({
      description: suggestion.description
    });
  }

  private removeDefaultSuggestion(): void {
    this.currentDefaultSuggestion = null;
    chrome.omnibox.setDefaultSuggestion(this.defaultSuggestion);
  }

  static createHighlighter(searchTerm: string): (haystack: string) => string {
    const expression = new RegExp(`(${searchTerm.replace(/([.?*+^$[\]\\(){}|-])/g, '$1')})`, 'gi');

    return (haystack: string) => haystack.replace(expression, '<match>$1</match>');
  }

  private createSuggestionResult(bookmark: BookmarkTreeNode, highlighter: Function): SuggestResult {
    const quoteAmpersands = (text: string) => text.replace(/&/g, '&amp;');

    if (bookmark.url) {
      return {
        description: `${quoteAmpersands(highlighter(bookmark.title))} <url>${quoteAmpersands(bookmark.url)}</url>`,
        content: bookmark.url,
      };
    }

    return {
      description: `${quoteAmpersands(highlighter(bookmark.title))} <dim>(${quoteAmpersands(this.folderDescription)})</dim>`,
      content: `bmfolder:${bookmark.id}`,
    };
  }

  private attemptHandle(suggestionContent: string): Promise<boolean> {
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
}
