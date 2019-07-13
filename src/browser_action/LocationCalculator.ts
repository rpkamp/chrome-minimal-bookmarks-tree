import {Offset} from "./Offset";

export interface LocationCalculator {
  calculate(dimensions: ClientRect, offset: Offset): Offset;
}
