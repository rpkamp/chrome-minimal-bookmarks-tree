import {Translator} from "../Translator";

export class ChromeTranslator implements Translator {
  translate(id: string): string {
    return chrome.i18n.getMessage(id);
  }
}
