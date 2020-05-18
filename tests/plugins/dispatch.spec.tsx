import * as rhl from "@testing-library/react-hooks";
import { createStore } from '../../src/index';
import counter from '../helpers/counter';
import createHook from '../helpers/createHook';

describe('dispatchPlugin', () => {
  test('invalidate effects', () => {
    const testModel = {
      state: 0,
      reducers: { foo: 1 },
    };
    expect(() => createStore(({ testModel } as any))).toThrow('Invalid reducer (testModel/foo). Must be a function');
  });

  test('invalidate reducers name', () => {
    const testModel = {
      state: 0,
      reducers: {
        '/reducer/': () => { },
      },
    };
    expect(() => createStore(({ testModel } as any))).toThrow('Invalid reducer name (testModel//reducer/)');
  });

  test('dispatch reducer normally', async () => {
    const store = createStore({ counter });
    const { Provider, useModel } = store;

    const { result } = createHook(Provider, useModel, 'counter');
    const dispatchers = result.current[1];
    rhl.act(() => dispatchers.increment(12));
    expect(result.current[0].count).toBe(12);
  });
});
