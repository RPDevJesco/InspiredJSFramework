// custom-element-framework.js

class CustomElement extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._bindings = new Map();
        this.state = new Proxy({}, {
            set: (target, property, value) => {
                target[property] = value;
                this.updateBindings();
                return true;
            }
        });

        // Automatically set templateUrl based on class name
        if (!this.constructor.templateUrl) {
            const className = this.constructor.name.toLowerCase();
            this.constructor.templateUrl = `/templates/${className}.html`;
        }
    }

    async connectedCallback() {
        this.template = await this.loadTemplate();
        this.render();
        this.componentDidMount && this.componentDidMount();
    }

    disconnectedCallback() {
        this.componentWillUnmount && this.componentWillUnmount();
    }

    async loadTemplate() {
        const templateUrl = this.constructor.templateUrl;
        if (!templateUrl) return null;

        const response = await fetch(templateUrl);
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        return doc.querySelector('template');
    }

    bindEvents() {
        this._shadowRoot.querySelectorAll('[on]').forEach(element => {
            const [eventName, methodName] = element.getAttribute('on').split(':');
            element.addEventListener(eventName, this[methodName].bind(this));
        });
    }

    updateBindings() {
        this._bindings.forEach((element, key) => {
            element.textContent = this.state[key];
        });
    }

    render() {
        if (this.template) {
            this._shadowRoot.innerHTML = '';
            this._shadowRoot.appendChild(this.template.content.cloneNode(true));
            this.bindEvents();
            this.setupBindings();
            this.updateBindings();
            this.renderSlots();
        }
    }

    setupBindings() {
        this._shadowRoot.querySelectorAll('[bind]').forEach(element => {
            const key = element.getAttribute('bind');
            this._bindings.set(key, element);
        });
    }

    renderSlots() {
        const slotElements = this._shadowRoot.querySelectorAll('slot');
        slotElements.forEach(slot => {
            const name = slot.getAttribute('name');
            const assignedNodes = this.querySelectorAll(`[slot="${name}"]`);
            assignedNodes.forEach(node => slot.appendChild(node));
        });
    }

    setState(newState) {
        Object.assign(this.state, newState);
    }
}

function reactive(target, key) {
    let value = target[key];
    Object.defineProperty(target, key, {
        get() {
            return value;
        },
        set(newValue) {
            value = newValue;
            this.updateBindings();
        }
    });
}

function defineCustomElement(name, elementClass) {
    customElements.define(name, elementClass);
}

export { CustomElement, reactive, defineCustomElement };