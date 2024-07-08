import { CustomElement, defineCustomElement } from './custom-element-framework.js';
import './counter.js'; // Import the Counter component

/**
 * NestedComponent is a custom element that includes an input for changing the message,
 * a custom-counter element, and a theme selector.
 */
class NestedComponent extends CustomElement {
    /**
     * Initializes the NestedComponent, sets up state management, and data bindings.
     */
    constructor() {
        super();
        this.state = new Proxy({
            message: 'Hello from Nested Component!',
            theme: 'light',
        }, {
            set: (target, property, value) => {
                target[property] = value;
                this.updateBindings(); // Update bindings whenever the state changes
                if (property === 'theme') {
                    this.applyTheme(this.themes[value]);
                }
                return true;
            }
        });

        this.applyTheme(this.themes[this.state.theme]);
    }

    /**
     * List of attributes to observe for changes and sync them to the state.
     */
    static get attributesList() {
        return ['theme'];
    }

    /**
     * Called when the element is added to the document's DOM.
     * Loads the template, renders the component, and calls componentDidMount if defined.
     */
    connectedCallback() {
        super.connectedCallback();
        this.componentDidMount();
    }

    /**
     * Called after the component has been mounted to the DOM.
     */
    componentDidMount() {
        console.log('NestedComponent mounted.');
    }

    /**
     * Called when the element is removed from the document's DOM.
     */
    componentWillUnmount() {
        console.log('NestedComponent will be unmounted.');
    }

    /**
     * Updates the message state when the input value changes.
     * @param {Event} event - The input event.
     */
    updateMessage(event) {
        this.setState({ message: event.target.value });
    }

    /**
     * Theme configurations for light and dark modes.
     */
    themes = {
        light: {
            'bg-color': '#f9f9f9',
            'text-color': '#333'
        },
        dark: {
            'bg-color': '#333',
            'text-color': '#f9f9f9'
        }
    };
}

// Define the custom element
defineCustomElement('nested-component', NestedComponent);