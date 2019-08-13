import { toJS } from '@ice/store';
import { detailedDiff } from 'deep-object-diff';

export default (store, next) => {
  const { storeManagers } = store;
  (window as any).ICESTORE = {
    getState: (namespace: string) => {
      storeManagers.forEach((value, index) => {
        const managerName = value.namespace;
        if (namespace !== undefined && namespace !== managerName) {
          return;
        }
        const storeManager = value.instance;
        const label = managerName !== undefined ? `(${managerName })` : '';
        console.log(`%cStore Manager ${index}: ${label}`, 'font-weight:bold; font-size: 14px;');
        const stores = storeManager.stores;
        Object.keys(stores).forEach((key) => {
          console.group(`Store Name: ${key}\n`);
          console.log('Current State\n', toJS(stores[key].getState()));
          console.groupEnd();
        });
      });
    },
  };
  return async (actionType, ...args) => {
    const { namespace, getState } = store;
    const preState = toJS(getState());
    await next(...args);

    const state = toJS(getState());
    const diff: any  = detailedDiff(preState, state);
    const hasChanges = obj => Object.keys(obj).length > 0;

    console.group('Store Name: ', namespace);
    console.log('Action Type: ', actionType);

    if (hasChanges(diff.added)) {
      console.log('Added\n', diff.added);
    }

    if (hasChanges(diff.updated)) {
      console.log('Updated\n', diff.updated);
    }

    if (hasChanges(diff.deleted)) {
      console.log('Deleted\n', diff.deleted);
    }

    console.log('Old State\n', preState);
    console.log('New State\n', state);
    console.groupEnd();
  }
}
