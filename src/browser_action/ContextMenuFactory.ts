import {ContextMenu} from "./ContextMenu";
import {ContextMenuTextItem} from "./context_menu/ContextMenuTextItem";
import {EditDialog} from "./dialog/EditDialog";
import {ConfirmDialog} from "./dialog/ConfirmDialog";
import {getElementData, openAllBookmarks, setElementData} from "./functions";
import {Translator} from "../common/Translator";
import {DialogRenderer} from "./DialogRenderer";
import {ContextMenuSeparator} from "./context_menu/ContextMenuSeparator";
import {BookmarkOpener, BookmarkOpeningDisposition} from "../common/BookmarkOpener";
import {Settings} from "../common/Settings";

export class ContextMenuFactory {
  private translator: Translator;
  private dialogRenderer: DialogRenderer;
  private settings: Settings;

  constructor(translator: Translator, dialogRenderer: DialogRenderer, settings: Settings) {
    this.translator = translator;
    this.dialogRenderer = dialogRenderer;
    this.settings = settings;
  }

  forBookmark(bookmark: HTMLElement) {
    const url = getElementData(bookmark, 'url');
    const itemId = getElementData(bookmark, 'item-id');
    const name = (bookmark.querySelector('span') as HTMLElement).innerText;

    return new ContextMenu(
      [
        new ContextMenuTextItem(
          this.translator.translate('popupEditBookmark'),
          () => {
            this.dialogRenderer.render(
              new EditDialog(
                [
                  {
                    id: 'name',
                    label: this.translator.translate('bookmarkEditName'),
                    value: name
                  },
                  {
                    id: 'url',
                    label: this.translator.translate('bookmarkEditUrl'),
                    value: url
                  }
                ],
                (data: { [s: string]: string }) => {
                  chrome.bookmarks.update(itemId, {title: data.name, url: data.url}, () => {
                    (bookmark.querySelector('span') as HTMLElement).innerText = data.name;
                    setElementData(bookmark, 'url', data.url);
                  });
                  bookmark.classList.remove('selected');
                }
              )
            );
          }
        ),
        new ContextMenuTextItem(
          this.translator.translate('popupDeleteBookmark'),
          () => {
            const deleteBookmark = () => {
              chrome.bookmarks.remove(itemId, () => {
                (bookmark.parentNode as HTMLElement).removeChild(bookmark);
              });
            };
            if (this.settings.isEnabled('confirm_bookmark_deletion')) {
              this.dialogRenderer.render(
                new ConfirmDialog(
                  `${this.translator.translate('deleteBookmark')}<br /><br />${name}`,
                  deleteBookmark
                )
              );
            } else {
              deleteBookmark();
            }
            bookmark.classList.remove('selected');
          }
        ),
        new ContextMenuSeparator(),
        new ContextMenuTextItem(
          this.translator.translate('popupOpenNewTab'),
          () => {
            BookmarkOpener.open(url, BookmarkOpeningDisposition.foregroundTab);
            bookmark.classList.remove('selected');
          }
        ),
        new ContextMenuTextItem(
          this.translator.translate('popupOpenNewWindow'),
          () => {
            BookmarkOpener.open(url, BookmarkOpeningDisposition.newWindow);
            bookmark.classList.remove('selected');
          }
        ),
        new ContextMenuTextItem(
          this.translator.translate('popupOpenNewIncognitoWindow'),
          () => {
            BookmarkOpener.open(url, BookmarkOpeningDisposition.newIncognitoWindow);
            bookmark.classList.remove('selected');
          }
        ),
      ]
    );
  }

  forFolder(folder: HTMLElement) {
    const itemId = getElementData(folder, 'item-id');
    const name = (folder.querySelector('span') as HTMLElement).innerText;

    return new ContextMenu(
      [
        new ContextMenuTextItem(
          this.translator.translate('popupOpenAll'),
          () => {
            openAllBookmarks(itemId);
            folder.classList.remove('selected');
          }
        ),
        new ContextMenuTextItem(
          this.translator.translate('popupEditFolder'),
          () => {
            this.dialogRenderer.render(
              new EditDialog(
                [
                  {
                    id: 'name',
                    label: this.translator.translate('bookmarkEditName'),
                    value: name
                  }
                ],
                (data: { [s: string]: string }) => {
                  chrome.bookmarks.update(itemId, {title: data.name}, () => {
                    (folder.querySelector('span') as HTMLElement).innerText = data.name;
                  });
                  folder.classList.remove('selected');
                }
              )
            );
          }
        ),
        new ContextMenuTextItem(
          this.translator.translate('popupDeleteFolder'),
          () => {
            this.dialogRenderer.render(
              new ConfirmDialog(
                `${this.translator.translate('deleteBookmarkFolder')}<br /><br />${name}`,
                () => {
                  chrome.bookmarks.removeTree(itemId, () => {
                    (folder.parentNode as Element).removeChild(folder);
                  });
                }
              )
            );
            folder.classList.remove('selected');
          }
        ),
      ]
    );
  }
}