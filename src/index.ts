import Store from './store';
import { React } from './types';
export default class Fiy {
    private react: React;

    private stroes: {[namespace: string]: Store} = {};

    public constructor(react: React) {
        this.react = react;
    }

    public registerStore(namespace: string, bindings: object): Store {
        if (this.stroes[namespace]) {
            throw new Error(`Namespace have been used: ${namespace}.`);
        }

        this.stroes[namespace] = new Store(bindings, this.react);
        return this.stroes[namespace];
    }

    private getModel(namespace: string): Store {
        const store: Store = this.stroes[namespace];
        if (!store) {
            throw new Error(`Not found namespace: ${namespace}.`);
        }
        return store;
    }

    public useStore(namespace: string) {
        return this.getModel(namespace).useStore();
    }
}