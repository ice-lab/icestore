import { toJS } from '@ice/store';
import { detailedDiff } from 'deep-object-diff';

export default async (ctx, next) => {
  const { namespace, getState } = ctx.store;
  const { name: actionName } = ctx.action;
  const preState = toJS(getState());

  const value = await next();

  const state = toJS(getState());
  const diff: any  = detailedDiff(preState, state);
  const hasChanges = obj => Object.keys(obj).length > 0;

  console.group('Store Name: ', namespace);
  console.log('Action Name: ', actionName);

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

  return value;
}

