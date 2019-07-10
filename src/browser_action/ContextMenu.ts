export type Offset = {
    x: number;
    y: number;
}

export type ContextMenuEvent = {
    action: string;
}

interface ContextMenuItem {
    render(window: Window, callback: Function): HTMLElement;
}

export class ContextMenuTextItem implements ContextMenuItem {
    action: string;
    label: string;

    constructor(action: string, label: string) {
        this.action = action;
        this.label = label;
    }

    render(window: Window, callback: Function): HTMLElement {
        const element = window.document.createElement('li');
        element.innerText = this.label;
        element.addEventListener('click', () => {
            callback({
                action: this.action
            });
        });

        return element;
    }
}

export class ContextMenuSeparator implements ContextMenuItem {
    render(window: Window, callback: Function): HTMLElement {
        return window.document.createElement('hr');
    }
}

export class ContextMenu {
    items: ContextMenuItem[];
    element: HTMLUListElement | null;
    callback: Function;

    constructor(items: ContextMenuItem[], callback: Function) {
        this.items = items;
        this.callback = callback;
    }

    show(window: Window, offset: Offset) {
        const document = window.document;
        const contextMenu = this.render(window);

        contextMenu.style.left = '-10000px';

        document.body.appendChild(contextMenu);

        const contextClientRect = contextMenu.getBoundingClientRect();

        let yCoordinate = offset.y;
        const windowHeight = window.innerHeight;
        const contextHeight = contextClientRect.height;
        if (yCoordinate > windowHeight - contextHeight) {
            yCoordinate = windowHeight - contextHeight - 15;
        }

        let xCoordinate = offset.x;
        const windowWidth = window.innerWidth;
        const contextWidth = contextClientRect.width;
        if (xCoordinate > windowWidth - contextWidth) {
            xCoordinate = windowWidth - contextWidth - 15;
        }

        contextMenu.style.left = `${xCoordinate}px`;
        contextMenu.style.top = `${yCoordinate}px`;

        this.element = contextMenu;
    }

    private render(window: Window): HTMLUListElement {
        const wrapper = window.document.createElement('ul');
        wrapper.className = 'contextMenu';

        for (let item of this.items) {
            wrapper.appendChild(
              item.render(window, (e: ContextMenuEvent) => this.callback(e))
            );
        }

        return wrapper;
    }

    destroy() {
        if (null === this.element || null === this.element.parentNode) {
            return;
        }

        this.element.parentNode.removeChild(this.element);
    }
}
