import appendReducers from '../../utils/appendReducers';
import { Models } from '../../types';

const originModels = {
  counter: {
    state: 0,
  },
};

describe('utils/appendReducers', () => {
  it('apply no reducers', () => {
    const models: Models = appendReducers(originModels);
    expect(Reflect.ownKeys(models)).toEqual(['counter']);

    const { counter } = models;
    expect(Reflect.ownKeys(counter)).toEqual(['state', 'reducers']);

    const { reducers } = counter;
    expect(Reflect.ownKeys(reducers).length).toBe(2);
  });
});
