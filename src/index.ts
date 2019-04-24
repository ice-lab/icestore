import Store from './store';
import { React } from './types';
export default class Fiy {
    private react: React;

    private stores: {[namespace: string]: Store} = {};

    public constructor(react: React) {
        this.react = react;
    }

    public registerStore(namespace: string, bindings: object): Store {
        if (this.stores[namespace]) {
            throw new Error(`Namespace have been used: ${namespace}.`);
        }

        this.stores[namespace] = new Store(bindings, this.react);
        return this.stores[namespace];
    }

    private getModel(namespace: string): Store {
        const store: Store = this.stores[namespace];
        if (!store) {
            throw new Error(`Not found namespace: ${namespace}.`);
        }
        return store;
    }

    public useStore(namespace: string) {
        return this.getModel(namespace).useStore();
    }
}