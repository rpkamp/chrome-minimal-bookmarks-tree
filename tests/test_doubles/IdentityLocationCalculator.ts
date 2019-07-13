import {LocationCalculator} from "../../src/browser_action/LocationCalculator";
import {Offset} from "../../src/browser_action/Offset";

export class IdentityLocationCalculator implements LocationCalculator {
  calculate(dimensions: ClientRect, offset: Offset): Offset {
    return offset;
  }
}
