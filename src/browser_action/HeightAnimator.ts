/**
 * This can probably be made generic rather easily, but for
 * now I don't need anything else than height animated, so
 * YAGNI.
 */
export default class HeightAnimator {
  element: HTMLHtmlElement;
  duration : number = 1;
  initialHeight : number = 0;
  delta : number = 0;
  targetHeight : number = 0;
  startTime : number | null = 0;

  constructor(element : HTMLHtmlElement, targetHeight : number | string, duration : number) {
    this.element = element;
    this.duration = duration;
    if (targetHeight === 'auto' && duration > 0) {
      this.targetHeight = Array.prototype.reduce.call(
        element.childNodes,
        (carry, child) => carry + (child.offsetHeight || 0),
        0,
      );
    } else if (typeof targetHeight === 'number') {
      this.targetHeight = targetHeight;
    } else {
      throw new Error('Target height must be an integer or "auto"');
    }
    this.startTime = null;
  }

  requestFrame() {
    window.requestAnimationFrame((timestamp) => {
      this.animateFrame(timestamp);
    });
  }

  animateFrame(timestamp : number) {
    this.startTime = this.startTime || timestamp;

    const progress = (timestamp - this.startTime) / this.duration;

    if (progress >= 1) {
      this.element.style.height = this.targetHeight === 0 ? '0px' : 'auto';

      return;
    }

    this.element.style.height = `${this.initialHeight + (progress * this.delta)}px`;

    this.requestFrame();
  }

  start() {
    if (this.duration <= 0) {
      this.element.style.height = `${this.targetHeight}px`;

      return;
    }

    const computedStyle = window.getComputedStyle(this.element, null);
    this.initialHeight = parseFloat(computedStyle.getPropertyValue('height'));

    if (this.initialHeight === this.targetHeight) {
      return;
    }

    this.delta = this.targetHeight - this.initialHeight;

    this.requestFrame();
  }
}
