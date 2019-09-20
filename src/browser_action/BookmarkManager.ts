import {DialogRenderer} from "./DialogRenderer";
import {Settings} from "../common/Settings";
import {Utils} from "../common/Utils";
import {ConfirmDialog} from "./dialog/ConfirmDialog";
import {Translator} from "../common/Translator";

export class BookmarkManager {
  private translator: Translator;
  private dialogRenderer: DialogRenderer;
  private settings: Settings;

  constructor(translator: Translator, dialogRenderer: DialogRenderer, settings: Settings) {
    this.translator = translator;
    this.dialogRenderer = dialogRenderer;
    this.settings = settings;
  }

  deleteBookmark(element: HTMLElement) {
    const itemId = Utils.getElementData(element, 'itemId');
    const name = (element.querySelector('span') as HTMLElement).innerText;

    const doDeleteBookmark = () => {
      chrome.bookmarks.remove(itemId, () => {
        (element.parentNode as HTMLElement).removeChild(element);
      });
    };
    if (this.settings.isEnabled('confirm_bookmark_deletion')) {
      this.dialogRenderer.render(
        new ConfirmDialog(
          `${this.translator.translate('deleteBookmark')}<br /><br />${name}`,
          doDeleteBookmark
        )
      );
    } else {
      doDeleteBookmark();
    }
  }
}
