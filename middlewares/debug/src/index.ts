import { toJS } from '@ice/store';
import { detailedDiff } from 'deep-object-diff';

export default store => next => async (...args) => {
  const { namespace, getState } = store;
  const preState = toJS(getState());
  await next(...args);

  const state = toJS(getState());
  const diff: any  = detailedDiff(preState, state);
  const hasChanges = obj => Object.keys(obj).length > 0;

  console.group('Store name: ', namespace);
  console.log('Action type: ', store.actionType);

  if (hasChanges(diff.added)) {
    console.log('Added\n', diff.added);
  }

  if (hasChanges(diff.updated)) {
    console.log('Updated\n', diff.updated);
  }

  if (hasChanges(diff.deleted)) {
    console.log('Deleted\n', diff.deleted);
  }

  console.log('New state\n', state);
  console.log('Old state\n', preState);
  console.groupEnd();
}

