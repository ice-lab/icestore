import React from 'react';
import * as rhl from "@testing-library/react-hooks";
import * as rtl from "@testing-library/react";
import { createStore } from '../../src/index';
import counter from '../helpers/counter';
import createHook from '../helpers/createHook';
import Counter, { CounterUseDispathcers, CounterUseActions } from '../helpers/CounterClassComponent';
import * as warning from '../../src/utils/warning';

describe('dispatchPlugin', () => {
  it('invalidate reducers', () => {
    const testModel = {
      state: 0,
      reducers: { foo: 1 },
    };
    expect(() => createStore(({ testModel } as any))).toThrow('Invalid reducer (testModel/foo). Must be a function');
  });

  it('invalidate reducer name', () => {
    const testModel = {
      state: 0,
      reducers: {
        '/reducer/': () => { },
      },
    };
    expect(() => createStore(({ testModel } as any))).toThrow('Invalid reducer name (testModel//reducer/)');
  });

  it('dispatch reducer in function component', async () => {
    const store = createStore({ counter });
    const { Provider, useModelDispatchers, useModelState } = store;

    const { result: dispatchersResult } = createHook(Provider, useModelDispatchers, 'counter');
    const { result: modelResult } = createHook(Provider, useModelState, "counter");
    const dispatchers = dispatchersResult.current;

    await rhl.act(async () => dispatchers.increment(6));
    expect(modelResult.current.count).toBe(6);
  });

  it('dispatch reducer in class component', () => {
    const store = createStore({ counter });
    const { Provider, withModelDispatchers, withModel } = store;
    const WithModelCounter = withModel('counter')(Counter);

    const WithCounterUseDispathcers = withModelDispatchers('counter')(CounterUseDispathcers);
    const tester = rtl.render(
      <Provider>
        <WithModelCounter>
          <WithCounterUseDispathcers />
        </WithModelCounter>
      </Provider>,
    );
    const { getByTestId } = tester;
    rtl.fireEvent.click(getByTestId('reset'));
    expect(getByTestId('count').innerHTML).toBe('0');
  });

  it('use the compatible useModelActions API to get the actions', async () => {
    const spy = jest.spyOn(warning, "default");
    const store = createStore({ counter });
    const { Provider, useModelActions, useModelState } = store;

    const { result: actionsResult } = createHook(Provider, useModelActions, 'counter');
    const { result: modelResult } = createHook(Provider, useModelState, "counter");
    const actions = actionsResult.current;

    await rhl.act(async () => actions.increment(6));
    expect(modelResult.current.count).toBe(6);
    expect(spy).toHaveBeenCalled();
  });

  it('use the compatible WithModelActions API to get the actions', () => {
    const store = createStore({ counter });
    const { Provider, withModelActions, withModel } = store;
    const WithModelCounter = withModel('counter')(Counter);

    const spy = jest.spyOn(warning, "default");

    const WithCounterUseActions = withModelActions('counter')(CounterUseActions);
    const tester = rtl.render(
      <Provider>
        <WithModelCounter>
          <WithCounterUseActions />
        </WithModelCounter>
      </Provider>,
    );
    const { getByTestId } = tester;
    rtl.fireEvent.click(getByTestId('reset'));
    expect(getByTestId('count').innerHTML).toBe('0');

    expect(spy).toHaveBeenCalled();
  });
});
