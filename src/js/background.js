/* global chrome */

import Settings from './settings';
import { setBrowserActionIcon, handleOpenAllBookmarks } from './functions';

const settings = new Settings();

function setDefaultSetting(key, value) {
  if (settings.get(key) === null) {
    settings.set(key, value);
  }
}

const version = settings.get('default_settings_version');
if (version === null) {
  setDefaultSetting('close_old_folder', false);
  setDefaultSetting('open_all_sub', true);
  setDefaultSetting('animation_duration', 200);
  setDefaultSetting('hide_empty_folders', false);
  setDefaultSetting('remember_scroll_position', true);
  setDefaultSetting('height', 500);
  setDefaultSetting('width', 300);
  setDefaultSetting('zoom', 100);
  setDefaultSetting('icon', 'default');

  settings.set('default_settings_version', 1);
}

setBrowserActionIcon(settings.get('icon'));

function htmlEncode(text) {
  return text.replace(/&/g, '&amp;');
}

chrome.omnibox.onInputChanged.addListener((query, suggest) => {
  chrome.bookmarks.search(query, (bookmarks) => {
    const suggestions = [];
    bookmarks.forEach((bookmark) => {
      if (bookmark.url) {
        suggestions.push({
          description: htmlEncode(bookmark.title),
          content: bookmark.url,
        });
      } else {
        suggestions.push({
          description: `${htmlEncode(bookmark.title)} (bookmarks folder)`,
          content: `bmfolder:${bookmark.id}`,
        });
      }
    });

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

  const matches = input.match(/^bmfolder:(\d+)$/);
  if (matches) {
    chrome.bookmarks.getSubTree(matches[1], (data) => {
      handleOpenAllBookmarks(data[0]);
    });
  }
});
