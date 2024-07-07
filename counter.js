// counter.js
import { CustomElement, defineCustomElement } from './custom-element-framework.js';

class Counter extends CustomElement {
    constructor() {
        super();
        this.state = new Proxy({
            count: 0,
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
        console.log('Counter component mounted.');
    }

    componentWillUnmount() {
        console.log('Counter component will be unmounted.');
    }

    increment() {
        this.setState({ count: this.state.count + 1 });
    }

    decrement() {
        this.setState({ count: this.state.count - 1 });
    }
}

// Define the custom element
defineCustomElement('custom-counter', Counter);