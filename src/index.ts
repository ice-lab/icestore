import Store from './store';
export default class Fiy {
    private stores: {[namespace: string]: Store} = {};

    public registerStore(namespace: string, bindings: object): Store {
        if (this.stores[namespace]) {
            throw new Error(`Namespace have been used: ${namespace}.`);
        }

        this.stores[namespace] = new Store(bindings);
        return this.stores[namespace];
    }

    private getModel(namespace: string): Store {
        const store: Store = this.stores[namespace];
        if (!store) {
            throw new Error(`Not found namespace: ${namespace}.`);
        }
        return store;
    }

    public useStore(namespace: string): object {
        return this.getModel(namespace).useStore();
    }

    public userStores(namespaces: string[]): object[] {
        return namespaces.map((namespace) => {
            return this.useStore(namespace);
        });
    }
}