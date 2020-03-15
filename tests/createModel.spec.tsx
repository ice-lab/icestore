/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import * as rtl from '@testing-library/react';
import * as rhl from '@testing-library/react-hooks';
import { createModel } from '../src/createModel';
import { todosWithAction } from './helpers/todos';
import counter from './helpers/counter';

describe('createModel', () => {
  it('expose methods', () => {
    const model = createModel(counter, 'counter');
    expect(model.length).toBe(4);
  });

  it('creating model with actions should console error', () => {
    const spy = jest.spyOn(console, 'error');
    createModel(todosWithAction);
    expect(spy).toHaveBeenCalled();
  });

  const [
    Provider,
    useState,
    useActions,
    useEffectsState,
  ] = createModel(counter);

  describe("Provider", () => {
    afterEach(() => rtl.cleanup());

    it('should not enforce one child', () => {
      expect(() =>
        rtl.render(
          <Provider count={0}>
            <div />
          </Provider>,
        ),
      ).not.toThrow();

      expect(() =>
        rtl.render(
          <Provider count={0}>
            <div />
            <div />
          </Provider>,
        ),
      ).not.toThrow();
    });
  });

  describe('useState', () => {
    it('passes the initial state to the Provider', () => {
      const { result } = rhl.renderHook(() => useState(), {
        wrapper: props => (
          <Provider count={0}>
            {props.children}
          </Provider>
        ),
      });
      expect(result.current.count).toEqual(0);
    });
  });

  it('useActions', () => {
    function useStateAndActions() {
      const state = useState();
      const actions = useActions();
      return { state, actions };
    }

    const { result } = rhl.renderHook(() => useStateAndActions(), {
      wrapper: props => (
        <Provider count={0}>
          {props.children}
        </Provider>
      ),
    });
    expect(result.current.state.count).toBe(0);
    expect(Reflect.ownKeys(result.current.actions).length).toBe(4);
    rhl.act(() => {
      result.current.actions.increment();
    });
    expect(result.current.state.count).toBe(1);
  });

  it('useEffectsState', async () => {
    function useStateEffects() {
      const state = useState();
      const actions = useActions();
      const effectsstate = useEffectsState();
      return { state, actions, effectsstate };
    }

    const { result, waitForNextUpdate } = rhl.renderHook(() => useStateEffects(), {
      wrapper: props => (
        <Provider count={0}>
          {props.children}
        </Provider>
      ),
    });
    expect(result.current.state.count).toBe(0);
    expect(Reflect.ownKeys(result.current.actions).includes('decrementAsync')).toBe(true);
    rhl.act(() => {
      result.current.actions.decrementAsync();
    });
    await waitForNextUpdate();
    expect(result.current.state.count).toBe(0);
    expect(result.current.effectsstate.decrementAsync).toEqual(
      {
        isLoading: false,
        error: Error(`count should be greater than or equal to 0`),
      },
    );

    rhl.act(() => {
      result.current.actions.increment();
    });
    expect(result.current.state.count).toBe(1);
    rhl.act(() => {
      result.current.actions.decrementAsync();
    });
    await waitForNextUpdate();
    expect(result.current.state.count).toBe(0);
  });
});
