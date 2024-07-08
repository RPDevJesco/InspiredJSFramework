import { CustomElement, defineCustomElement } from './custom-element-framework.js';
import './counter.js'; // Import the Counter component

class NestedComponent extends CustomElement {
    constructor() {
        super();
        this.state = new Proxy({
            message: 'Hello from Nested Component!',
        }, {
            set: (target, property, value) => {
                target[property] = value;
                this.updateBindings();
                return true;
            }
        });
    }

    connectedCallback() {
        super.connectedCallback();
        this.componentDidMount();
    }

    componentDidMount() {
        console.log('NestedComponent mounted.');
    }

    componentWillUnmount() {
        console.log('NestedComponent will be unmounted.');
    }

    updateMessage(event) {
        this.setState({ message: event.target.value });
    }
}

// Define the custom element
defineCustomElement('nested-component', NestedComponent);