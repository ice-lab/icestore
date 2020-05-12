import React from 'react';
import * as rhl from "@testing-library/react-hooks";
import { createStore } from '../../src/index';
import counter from '../helpers/counter';

describe('effects', () => {

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

  const todos = {
    state: [],
    reducers: {
      add(state, todo = {}) {
        state.push(todo);
      },
    },
    effects: (dispatch) => ({
      add(todo) {
        dispatch.counter.asyncIncrement();
      },
      decreCounter() {
        dispatch.counter.asyncDecrement(1);
      },
    }),
  };
  const store = createStore({ counter, todos });
  const { Provider, useModel } = store;

  test('normal effects usage', async () => {
    const { result, waitForNextUpdate } = createHook(Provider, useModel, 'counter');
    expect(result.current[0].count).toBe(0);
    rhl.act(() => result.current[1].asyncIncrement());
    await waitForNextUpdate({ timeout: 200 });
    expect(result.current[0].count).toBe(1);
  });

  test('dispatch action for other models', async () => {
    const { result: counterResult, waitForNextUpdate } = createHook(Provider, useModel, 'counter');
    const { result: todosResult } = createHook(Provider, useModel, 'todos');

    rhl.act(() => todosResult.current[1].decreCounter());
    await waitForNextUpdate();
    expect(counterResult.current[0].count).toBe(0);
  });

  test('a effect that shares a name with a reducer', async () => {
    const { result: counterResult, waitForNextUpdate } = createHook(Provider, useModel, 'counter');
    const { result: todosResult } = createHook(Provider, useModel, 'todos');

    rhl.act(() => todosResult.current[1].add({ name: 'test' }));
    await waitForNextUpdate();
    expect(counterResult.current[0].count).toBe(1);
    expect(todosResult.current[0]).toEqual([{ name: 'test' }]);
  });
});

function createHook(Provider, callback, namespace) {
  return rhl.renderHook(() => callback(namespace), {
    wrapper: (props) => (
      <Provider {...props}>
        {props.children}
      </Provider>
    ),
  });
}
