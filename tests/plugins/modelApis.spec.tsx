import React, { useCallback } from 'react';
import * as rhl from '@testing-library/react-hooks';
import * as rtl from "@testing-library/react";
import createStore, { withModel } from '../../src/index';
import counter, { counterWithUnsupportEffects } from '../helpers/counter';
import Counter, { CounterUseEffectsState } from '../helpers/CounterClassComponent';
import createHook from '../helpers/createHook';
import * as warning from '../../src/utils/warning';

describe('modelApisPlugin', () => {
  it('throw error when trying to use the inexisted model', () => {
    const store = createStore({ counter });
    const {
      Provider,
      useModel,
      useModelDispatchers,
      useModelEffectsState,
    } = store;
    const namespace = 'test';
    const { result: useModelActionsStateResult } = createHook(Provider, useModelEffectsState, namespace);
    expect(useModelActionsStateResult.error).toEqual(
      Error(`Not found model by namespace: ${namespace}.`),
    );

    const { result: useModelDispatchersResult } = createHook(Provider, useModelDispatchers, namespace);
    expect(useModelDispatchersResult.error).toEqual(
      Error(`Not found model by namespace: ${namespace}.`),
    );

    const { result: useModelResult } = createHook(Provider, useModel, namespace);
    expect(useModelResult.error).toEqual(
      Error(`Not found model by namespace: ${namespace}.`),
    );
  });

  it('create unsupported effects should throw error', () => {
    expect(() => {
      createStore({ counterWithUnsupportEffects });
    }).toThrow();
  });

  it('useModelEffectsState', async () => {
    const store = createStore({ counter });
    const {
      Provider,
      useModel,
      useModelEffectsState,
    } = store;

    function useModelEffect(namespace) {
      const [state, dispatchers] = useModel(namespace);
      const effectsState = useModelEffectsState(namespace);
      return { state, dispatchers, effectsState };
    }

    const { result, waitForNextUpdate } = createHook(Provider, useModelEffect, 'counter');
    expect(result.current.effectsState.throwError).toEqual({ isLoading: false, error: null });
    rhl.act(() => {
      result.current.dispatchers.throwError();
    });

    expect(result.current.effectsState.throwError).toEqual({ isLoading: true, error: null });
    await waitForNextUpdate();
    expect(result.current.effectsState.throwError).toEqual({ isLoading: false, error: Error('Error!') });
  });

  it('withModelEffectsState', (done) => {
    const store = createStore({ counter });
    const {
      Provider,
      withModel,
      withModelEffectsState,
    } = store;

    const WithCounterUseEffectsState = withModelEffectsState('counter')(CounterUseEffectsState);
    const WithModelCounter = withModel('counter')(Counter);
    const spy = jest.spyOn(warning, 'default');

    const tester = rtl.render(
      <Provider>
        <WithCounterUseEffectsState>
          <WithModelCounter />
        </WithCounterUseEffectsState>
      </Provider>,
    );
    const { getByTestId } = tester;
    rtl.fireEvent.click(getByTestId('throwError'));
    expect(getByTestId('throwErrorEffectsLoading').innerHTML).toBe('true');
    expect(getByTestId('throwErrorEffectsError').innerHTML).toBe('null');

    setTimeout(() => {
      expect(getByTestId('throwErrorEffectsLoading').innerHTML).toBe('false');
      expect(getByTestId('throwErrorEffectsError').innerHTML).toBe('Error: Error!');
      done();
    }, 200);

    // TODO
    // expect(spy).toHaveBeenCalled();
  });

  it('get model api: should set counter to updated initial value', () => {
    const store = createStore({ counter });

    function useCounter(initialValue = 0) {
      const setCounter = useCallback(() => {
        const [state, dispatchers] = store.getModel('counter');

        if (state.count >= 10) {
          return;
        }
        dispatchers.setState({ count: initialValue });
      }, [initialValue]);
      return { setCounter };
    }

    let initialValue = 0;
    const { result, rerender } = rhl.renderHook(() => useCounter(initialValue));

    initialValue = 10;
    rerender();
    rhl.act(() => {
      result.current.setCounter();
    });
    expect(store.getModelState('counter').count).toBe(10);

    initialValue = 20;
    rerender();
    rhl.act(() => {
      result.current.setCounter(); // fail to update the state
    });
    expect(store.getModelState('counter').count).toBe(10);
  });

  it('useState', () => {
    function CounterComponent({ model }) {
      const { useState } = model;
      const counterState = useState('counter');
      expect(counterState).toEqual({ count: 0 });
      return (
        <div />
      );
    }

    const WithModelCounter = withModel(counter)(CounterComponent);
    rtl.render(
      <WithModelCounter />,
    );
  });

  it('useDispatchers', () => {
    function CounterComponent({ model }) {
      const { useDispatchers, useState } = model;
      const dispatchers = useDispatchers('counter');
      const state = useState('counter');
      return (
        <div>
          <div data-testid="count">{state.count}</div>
          <div data-testid="increment" onClick={() => dispatchers.increment(1)} />
        </div>
      );
    }

    const WithModelCounter = withModel(counter)(CounterComponent);
    const tester = rtl.render(
      <WithModelCounter />,
    );
    const { getByTestId } = tester;
    expect(getByTestId('count').innerHTML).toBe('0');
    rtl.fireEvent.click(getByTestId('increment'));
    expect(getByTestId('count').innerHTML).toBe('1');
  });

  it('useValue', () => {
    function CounterComponent({ model }) {
      const [state, dispatchers] = model.useValue('counter');
      const { increment } = dispatchers;
      const { count } = state;
      return (
        <div>
          <div data-testid="count">{count}</div>
          <div data-testid="increment" onClick={() => increment(1)} />
        </div>
      );
    }

    const WithModelCounter = withModel(counter)(CounterComponent);
    const tester = rtl.render(
      <WithModelCounter />,
    );
    const { getByTestId } = tester;
    expect(getByTestId('count').innerHTML).toBe('0');
    rtl.fireEvent.click(getByTestId('increment'));
    expect(getByTestId('count').innerHTML).toBe('1');
  });

  it('useEffectsError', (done) => {
    function CounterComponent({ model }) {
      const dispatchers = model.useDispatchers('counter');
      const effectsError = model.useEffectsError('counter');
      const { throwError } = dispatchers;
      return (
        <div>
          <div data-testid="error">{String(effectsError.throwError.error)}</div>
          <div data-testid="throwError" onClick={() => throwError()} />
        </div>
      );
    };
    const WithModelCounter = withModel(counter)(CounterComponent);
    const tester = rtl.render(
      <WithModelCounter />,
    );
    const { getByTestId } = tester;
    expect(getByTestId('error').innerHTML).toBe('null');
    rtl.fireEvent.click(getByTestId('throwError'));
    setTimeout(() => {
      expect(getByTestId('error').innerHTML).toBe('Error: Error!');
      done();
    }, 200);
  });

  it('useEffectsLoading', (done) => {
    function CounterComponent({ model }) {
      const dispatchers = model.useDispatchers('counter');
      const effectsloading = model.useEffectsLoading('counter');
      const { asyncIncrement } = dispatchers;
      return (
        <div>
          <div data-testid="loading">{String(effectsloading.asyncIncrement)}</div>
          <div data-testid="asyncIncrement" onClick={() => asyncIncrement()} />
        </div>
      );
    };
    const WithModelCounter = withModel(counter)(CounterComponent);
    const tester = rtl.render(
      <WithModelCounter />,
    );
    const { getByTestId } = tester;
    expect(getByTestId('loading').innerHTML).toBe('false');
    rtl.fireEvent.click(getByTestId('asyncIncrement'));
    expect(getByTestId('loading').innerHTML).toBe('true');
    setTimeout(() => {
      expect(getByTestId('loading').innerHTML).toBe('false');
      done();
    }, 200);
  });

  it('useEffectsState', (done) => {
    function CounterComponent({ model }) {
      const dispatchers = model.useDispatchers('counter');
      const effectsState = model.useEffectsState('counter');
      const { throwError } = dispatchers;
      return (
        <div>
          <div data-testid="loading">{String(effectsState.throwError.isLoading)}</div>
          <div data-testid="error">{String(effectsState.throwError.error)}</div>
          <div data-testid="throwError" onClick={() => throwError()} />
        </div>
      );
    };
    const WithModelCounter = withModel(counter)(CounterComponent);
    const tester = rtl.render(
      <WithModelCounter />,
    );
    const { getByTestId } = tester;
    expect(getByTestId('loading').innerHTML).toBe('false');
    expect(getByTestId('error').innerHTML).toBe('null');
    rtl.fireEvent.click(getByTestId('throwError'));
    expect(getByTestId('loading').innerHTML).toBe('true');
    expect(getByTestId('error').innerHTML).toBe('null');
    setTimeout(() => {
      expect(getByTestId('loading').innerHTML).toBe('false');
      expect(getByTestId('error').innerHTML).toBe('Error: Error!');
      done();
    }, 200);
  });
});
