import {Translator} from "../../src/common/Translator";

export class IdentityTranslator implements Translator {
  translate(id: string): string {
    return id;
  }
}
