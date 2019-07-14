import HeightAnimator from "./HeightAnimator";
import PersistentSet from "./PersistentSet";
import {TreeRenderer} from "./TreeRenderer";
import {Settings} from "../common/Settings";
import {Utils} from "../common/Utils";

export class FolderToggler {
  private openFolders: PersistentSet<string>;
  private treeRenderer: TreeRenderer;
  private settings: Settings;

  constructor(
    openFolders: PersistentSet<string>,
    treeRenderer: TreeRenderer,
    settings: Settings
  ) {
    this.openFolders = openFolders;
    this.treeRenderer = treeRenderer;
    this.settings = settings;
  }

  toggle(element: HTMLElement): void {
    if (Utils.getElementData(element, 'loaded') === '1') {
      this.folderLoaded(element);

      return;
    }

    chrome.bookmarks.getSubTree(Utils.getElementData(element, 'itemId'), (data) => {
      const t = this.treeRenderer.renderTree(
        data[0],
        document,
        false,
        false,
      );
      element.appendChild(t);
      element.dataset.loaded = '1';
      this.folderLoaded(element);
    });
  }

  private folderLoaded(element: HTMLElement): void {
    const animationDuration = this.settings.getNumber('animation_duration');

    if (this.settings.isEnabled('close_old_folder')) {
      if (!(element.parentNode instanceof HTMLElement)) {
        return;
      }

      element.parentNode.querySelectorAll('.folder.open').forEach((openFolderElement: Element) => {
        if (openFolderElement !== element) {
          openFolderElement.classList.remove('open');
          openFolderElement.querySelectorAll('.sub').forEach((elementToHide: Element) => {
            FolderToggler.slideUp(<HTMLElement>elementToHide, animationDuration);
          });
        }
      });
    }

    element.classList.toggle('open');
    const isOpen = element.classList.contains('open');
    const elementToToggle = <HTMLHtmlElement>element.querySelectorAll('.sub')[0];
    if (isOpen) {
      FolderToggler.slideDown(elementToToggle, animationDuration);
    } else {
      FolderToggler.slideUp(elementToToggle, animationDuration);
    }

    const id = Utils.getElementData(<HTMLElement>elementToToggle.parentNode, 'itemId');
    if (this.settings.isEnabled('close_old_folder')) {
      this.openFolders.clear();
      if (isOpen) {
        this.openFolders.add(id);
      }
      const parents = FolderToggler.getAncestorsWithClass(element, 'open');
      parents.forEach((parent) => {
        this.openFolders.add(Utils.getElementData(<HTMLElement>parent, 'itemId'));
      });

      return;
    }

    if (isOpen) {
      this.openFolders.add(id);

      return;
    }

    this.openFolders.remove(id);
    elementToToggle.querySelectorAll('li').forEach((folderToHide) => {
      this.openFolders.remove(Utils.getElementData(folderToHide, 'itemId'));
      folderToHide.classList.remove('open');
      folderToHide.querySelectorAll('.sub').forEach((sub: Element) => {
        FolderToggler.slideUp(<HTMLElement>sub, animationDuration);
      });
    });
  }

  static slideUp(element: HTMLElement, duration: number): void {
    const animator = new HeightAnimator(element, 0, duration);
    animator.start();
  }

  static slideDown(element: HTMLElement, duration: number): void {
    const animator = new HeightAnimator(element, 'auto', duration);
    animator.start();
  }

  static getAncestorsWithClass(element: Element, className: string): Element[] {
    const parents: Element[] = [];

    if (!(element.parentNode instanceof Element)) {
      return parents;
    }

    if (element.parentNode.classList.contains(className)) {
      parents.push(element.parentNode);
    }

    return parents.concat(FolderToggler.getAncestorsWithClass(element.parentNode, className));
  }
}
