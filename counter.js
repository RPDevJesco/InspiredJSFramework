import { CustomElement, defineCustomElement } from './custom-element-framework.js';

class Counter extends CustomElement {
    constructor() {
        super();
        this.state = new Proxy({
            count: 0,
            theme: 'light',
        }, {
            set: (target, property, value) => {
                target[property] = value;
                this.updateBindings();
                if (property === 'theme') {
                    this.applyTheme(this.themes[value]);
                }
                return true;
            }
        });

        this.defineComputedProperty('doubleCount', () => this.state.count * 2);
    }

    static get attributesList() {
        return ['count', 'theme'];
    }

    connectedCallback() {
        super.connectedCallback();
        this.componentDidMount();
    }

    componentDidMount() {
        console.log('EnhancedCounter component mounted.');
    }

    componentWillUpdate(newState) {
        console.log('EnhancedCounter will update with', newState);
    }

    componentDidUpdate() {
        console.log('EnhancedCounter did update.');
    }

    increment() {
        this.setState({ count: this.state.count + 1 });
        this.dispatchCustomEvent('countChanged', { count: this.state.count });
    }

    decrement() {
        this.setState({ count: this.state.count - 1 });
        this.dispatchCustomEvent('countChanged', { count: this.state.count });
    }

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
defineCustomElement('custom-counter', Counter);