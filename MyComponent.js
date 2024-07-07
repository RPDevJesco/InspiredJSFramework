// my-component.js

import { CustomElement, defineCustomElement } from './custom-element-framework.js';

class MyComponent extends CustomElement {
    constructor() {
        super();
        this.state = new Proxy({
            message: 'Hello, world!',
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
        console.log('MyComponent mounted.');
    }

    componentWillUnmount() {
        console.log('MyComponent will be unmounted.');
    }

    updateMessage(event) {
        this.setState({ message: event.target.value });
    }
}

// Define the custom element
defineCustomElement('my-component', MyComponent);