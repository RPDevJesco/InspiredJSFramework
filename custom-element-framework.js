// custom-element-framework.js

// Define a base class for custom elements, extending from HTMLElement
class CustomElement extends HTMLElement {
    constructor() {
        super(); // Call the parent class's constructor

        // Create a shadow DOM and attach it to the element
        this._shadowRoot = this.attachShadow({ mode: 'open' });

        // Initialize a map to store bindings between state properties and DOM elements
        this._bindings = new Map();

        // Create a proxy for the component's state to track changes and update bindings automatically
        this.state = new Proxy({}, {
            set: (target, property, value) => {
                target[property] = value; // Set the property value
                this.updateBindings(); // Update the bindings whenever the state changes
                return true;
            }
        });

        // Determine the template URL based on the class name if not explicitly set
        if (!this.constructor.templateUrl) {
            const className = this.constructor.name.toLowerCase();
            this.constructor.templateUrl = `/templates/${className}.html`;
        }
    }

    // Called when the element is added to the document's DOM
    async connectedCallback() {
        this.template = await this.loadTemplate(); // Load the template asynchronously
        this.render(); // Render the component
        this.componentDidMount && this.componentDidMount(); // Call componentDidMount if defined
    }

    // Called when the element is removed from the document's DOM
    disconnectedCallback() {
        this.componentWillUnmount && this.componentWillUnmount(); // Call componentWillUnmount if defined
    }

    // Load the HTML template from the specified URL
    async loadTemplate() {
        const templateUrl = this.constructor.templateUrl;
        if (!templateUrl) return null; // Return null if no template URL is set

        const response = await fetch(templateUrl); // Fetch the template
        const text = await response.text(); // Get the template text
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html'); // Parse the template text as HTML
        return doc.querySelector('template'); // Return the <template> element
    }

    // Bind event listeners to elements with the 'on' attribute
    bindEvents() {
        this._shadowRoot.querySelectorAll('[on]').forEach(element => {
            const eventBinding = element.getAttribute('on'); // Get the event binding string
            const matches = eventBinding.match(/(\w+):"?{{(\w+)}}"?/); // Extract the event name and method name
            if (matches) {
                const [, eventName, methodName] = matches;
                element.addEventListener(eventName, this[methodName].bind(this)); // Bind the event listener
            }
        });
    }

    // Update the text content of elements bound to state properties
    updateBindings() {
        this._bindings.forEach((element, key) => {
            element.textContent = this.state[key];
        });
    }

    // Render the component by attaching the template content to the shadow DOM
    render() {
        if (this.template) {
            this._shadowRoot.innerHTML = ''; // Clear the shadow DOM
            const content = this.template.content.cloneNode(true); // Clone the template content
            this.processBindings(content); // Process data bindings in the template
            this._shadowRoot.appendChild(content); // Append the template content to the shadow DOM
            this.bindEvents(); // Bind events to the elements
            this.updateBindings(); // Update bindings with the current state
            this.renderSlots(); // Render slot content
        }
    }

    // Process data bindings in the template content
    processBindings(content) {
        content.querySelectorAll('*').forEach(element => {
            Array.from(element.attributes).forEach(attr => {
                if (attr.value.match(/{{.*}}/)) { // Check if the attribute value contains a binding
                    const key = attr.value.match(/{{(.*)}}/)[1];
                    if (attr.name === 'bind') {
                        this._bindings.set(key, element); // Bind the element to the state property
                    } else {
                        const originalValue = attr.value;
                        Object.defineProperty(element, attr.name, {
                            get: () => this.state[key],
                            set: (value) => {
                                this.state[key] = value;
                                attr.value = originalValue;
                            }
                        });
                    }
                }
            });
            if (element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE) {
                const text = element.childNodes[0].textContent;
                const match = text.match(/{{(.*)}}/);
                if (match) {
                    const key = match[1];
                    this._bindings.set(key, element); // Bind the element to the state property
                }
            }
        });
    }

    // Render the slot content by appending assigned nodes to their respective slots
    renderSlots() {
        const slotElements = this._shadowRoot.querySelectorAll('slot');
        slotElements.forEach(slot => {
            const name = slot.getAttribute('name');
            const assignedNodes = this.querySelectorAll(`[slot="${name}"]`);
            assignedNodes.forEach(node => slot.appendChild(node)); // Append assigned nodes to the slot
        });
    }

    // Set the state properties and trigger bindings update
    setState(newState) {
        Object.assign(this.state, newState); // Merge new state with the existing state
    }
}

// Define a custom element with the specified name and class
function defineCustomElement(name, elementClass) {
    customElements.define(name, elementClass); // Register the custom element with the browser
}

export { CustomElement, defineCustomElement }; // Export the CustomElement class and defineCustomElement function