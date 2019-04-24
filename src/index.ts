import Store from './store';

export default class Fiy {
  constructor(private react) {
  }

  private stroes: {[namespace: string]: Store} = {};

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

  public useStroe(namespace: string) {
    return this.getModel(namespace).useStroe();
  }
}