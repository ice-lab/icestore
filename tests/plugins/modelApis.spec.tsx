import { useCallback } from 'react';
import * as rhl from "@testing-library/react-hooks";
import { createStore } from '../../src/index';
import counter, { counterWithUnsupportEffects } from '../helpers/counter';
import createHook from '../helpers/createHook';
import * as warning from '../../src/utils/warning';

describe('modelApisPlugin', () => {
  const store = createStore({ counter });
  const {
    Provider,
    useModel,
    useModelDispatchers,
    useModelEffectsState,
    useModelActionsState,
    useModelActions,
    useModelState,
  } = store;

  it("throw error when trying to use the inexisted model", () => {
    const namespace = "test";
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

  it("create unsupported effects should be warned", () => {
    const spy = jest.spyOn(warning, "default");
    createStore({ counterWithUnsupportEffects });
    expect(spy).toHaveBeenCalled();
  });

  it('useModelEffectsState', async () => {
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


  it("use the compatible useModelActionsState API to get the effects state", async () => {
    const spy = jest.spyOn(warning, "default");

    function useModelEffect(namespace) {
      const [state, dispatchers] = useModel(namespace);
      const effectsState = useModelActionsState(namespace);
      return { state, dispatchers, effectsState };
    }

    const { result, waitForNextUpdate } = createHook(Provider, useModelEffect, 'counter');

    rhl.act(() => {
      result.current.dispatchers.throwError();
    });
    expect(result.current.effectsState.throwError).toEqual({ isLoading: true, error: null });
    await waitForNextUpdate();
    expect(result.current.effectsState.throwError).toEqual({ isLoading: false, error: Error('Error!') });

    expect(spy).toHaveBeenCalled();
  });

  it("get model api: should set counter to updated initial value", () => {
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

  // it('', () => {

  // });
});
