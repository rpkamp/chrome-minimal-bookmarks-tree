import {OmniboxSuggester} from './OmniboxSuggester';
import {SettingsFactory} from '../common/settings/SettingsFactory';
import {Utils} from "../common/Utils";
import {ChromeTranslator} from "../common/translator/ChromeTranslator";
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

const translator = new ChromeTranslator();
const suggester = new OmniboxSuggester(translator);

chrome.runtime.onStartup.addListener(() => {
  const settings = SettingsFactory.create();

  Utils.setBrowserActionIcon(settings.getString('icon'));
});

chrome.omnibox.onInputChanged.addListener((input: string, callback: Function) => {
  chrome.bookmarks.search(input, (bookmarksAndFolders: BookmarkTreeNode[]) => {
    suggester.suggest(input, bookmarksAndFolders, callback);
  });
});

chrome.omnibox.onInputEntered.addListener((suggestionContent: string) => {
  suggester.handle(suggestionContent);
});
