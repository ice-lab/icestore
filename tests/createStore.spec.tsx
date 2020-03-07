import React from 'react';
import { render } from "@testing-library/react";
import { createStore } from '../src/createStore';
import * as models from './helpers/models';

describe('createStore', () => {
  it('exposes the public API', () => {
    const store = createStore(models);
    const methods = Reflect.ownKeys(store);

    expect(methods.length).toBe(9);
    expect(methods).toContain('Provider');
    expect(methods).toContain('useModel');
    expect(methods).toContain('useModelActions');
    expect(methods).toContain('useModelEffectsState');
    expect(methods).toContain('withModel');
    expect(methods).toContain('withModelActions');
    expect(methods).toContain('withModelEffectsState');
    expect(methods).toContain('useModelActionsState');
    expect(methods).toContain('withModelActionsState');
  });

  // it('Provider', () => {
  //   const store = createStore(models);
  //   const { Provider } = store;
  // });

  describe("Provider", () => {

  });

  // it('useModel', () => {
  //   const store = createStore(models);
  //   const { useModel } = store;
  //   const [state, actions] = useModel('todos');
  //   expect(state.dataSource).toEqual([
  //     {
  //       name: 'Init',
  //       done: false,
  //     },
  //   ]);
  // });
});
