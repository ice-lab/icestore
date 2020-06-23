import * as rhl from "@testing-library/react-hooks";
import { createStore } from '../../src/index';
import counter, { counterCustomSetState } from '../helpers/counter';
import todos from '../helpers/todos';
import createHook from '../helpers/createHook';

describe('effectsPlugin', () => {
  test('invalidate effects', () => {
    const testModel = {
      state: 0,
      effects: () => { },
    };
    expect(() => createStore(({ testModel } as any))).toThrow('Invalid effects from Model(testModel), effects should return an object');
  });

  test('invalidate effect name', () => {
    const testModel = {
      state: 0,
      effects: () => ({ 'test/effect': () => { } }),
    };
    expect(() => createStore(({ testModel } as any))).toThrow('Invalid effect name (testModel/test/effect)');
  });

  test('invalidate effect', () => {
    const testModel = {
      state: 0,
      effects: () => ({ 'test': 1 }),
    };
    expect(() => createStore(({ testModel } as any))).toThrow('Invalid effect (testModel/test). Must be a function');
  });

  test('normal effects usage', async () => {
    const store = createStore({ counter });
    const { useModel, Provider } = store;

    const { result, waitForNextUpdate } = createHook(Provider, useModel, 'counter');
    expect(result.current[0].count).toBe(0);
    rhl.act(() => result.current[1].asyncIncrement());
    await waitForNextUpdate({ timeout: 200 });
    expect(result.current[0].count).toBe(1);
    rhl.act(() => result.current[1].asyncDecrement());
    await waitForNextUpdate({ timeout: 200 });
    expect(result.current[0].count).toBe(0);
  });

  test('dispatch inner effect', async () => {
    const store = createStore({ counter });
    const { useModel, Provider } = store;

    const { result, waitForNextUpdate } = createHook(Provider, useModel, 'counter');
    expect(result.current[0].count).toBe(0);
    rhl.act(() => result.current[1].asyncCallIncrement());
    await waitForNextUpdate({ timeout: 200 });
    expect(result.current[0].count).toBe(1);
  });

  test('dispatch action for other models', async () => {
    const store = createStore({ counter, todos });
    const { useModel, Provider } = store;

    const { result: counterResult, waitForNextUpdate } = createHook(Provider, useModel, 'counter');
    const { result: todosResult } = createHook(Provider, useModel, 'todos');
    expect(counterResult.current[0].count).toBe(0);
    rhl.act(() => todosResult.current[1].decreCounter());
    await waitForNextUpdate();
    expect(counterResult.current[0].count).toBe(-1);
  });

  test('multiple actions', (done) => {
    const store = createStore({ counter });
    const { useModel, Provider } = store;

    const { result } = createHook(Provider, useModel, 'counter');
    expect(result.current[0].count).toBe(0);
    rhl.act(() => result.current[1].incrementSome());
    setTimeout(() => {
      expect(result.current[0].count).toBe(4);
      done();
    }, 1000);
  });

  test('normal setState', async () => {
    const store = createStore({ counter });
    const { useModel, Provider } = store;

    const { result, waitForNextUpdate } = createHook(Provider, useModel, 'counter');
    rhl.act(() => result.current[1].increment(4));
    expect(result.current[0].count).toBe(4);
    rhl.act(() => result.current[1].setCount(0));
    await waitForNextUpdate();
    expect(result.current[0].count).toBe(0);
  });

  test('custom setState in reducers', async () => {
    const store = createStore({ counterCustomSetState });
    const { useModel, Provider } = store;

    const { result, waitForNextUpdate } = createHook(Provider, useModel, 'counterCustomSetState');
    expect(result.current[0].count).toBe(0);
    rhl.act(() => result.current[1].setCount(1));
    await waitForNextUpdate();
    expect(result.current[0].count).toBe(2);
  });

  test('a effect that shares a name with a reducer', async () => {
    const store = createStore({ counter, todos });
    const { useModel, Provider } = store;

    const { result: counterResult, waitForNextUpdate } = createHook(Provider, useModel, 'counter');
    const { result: todosResult } = createHook(Provider, useModel, 'todos');

    expect(counterResult.current[0].count).toBe(0);
    rhl.act(() => todosResult.current[1].add({ name: 'test' }));
    await waitForNextUpdate();
    expect(counterResult.current[0].count).toBe(1);
    expect(todosResult.current[0]).toEqual([{ name: 'test' }]);
  });
});
