import {LocationCalculator} from "../LocationCalculator";
import {Offset} from "../Offset";

export class WindowLocationCalculator implements LocationCalculator {
  private readonly window: Window;

  constructor(window: Window) {
    this.window = window;
  }

  calculate(dimensions: ClientRect, offset: Offset): Offset {
    return {
      x: Math.min(offset.x, this.window.innerWidth - dimensions.width - 15),
      y: Math.min(offset.y, this.window.innerHeight - dimensions.height - 15)
    };
  }
}
