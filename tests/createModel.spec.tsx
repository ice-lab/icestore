import { createModel } from '../src/createModel';
import todos, { todosWithAction } from './helpers/todos';

describe('createModel', () => {
  it('expose methods', () => {
    const model = createModel(todos);
    expect(model.length).toBe(4);
  });

  it('create model with actions should console error', () => {
    const spy = jest.spyOn(console, 'error');
    const model = createModel(todosWithAction);
    expect(spy).toHaveBeenCalled();
  });
});

