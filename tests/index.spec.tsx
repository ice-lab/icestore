/* eslint-disable react/jsx-filename-extension */
import React, { useCallback, useState } from "react";
import * as rhl from "@testing-library/react-hooks";
import * as rtl from "@testing-library/react";
import createStore from "../src/index";
import * as models from "./helpers/models";
import counterModel, { counterWithUnsupportEffects, counterWithNoImmer } from "./helpers/counter";
import Counter, { CounterUseDispathcers, CounterUseEffectsState } from './helpers/CounterComponent';
import * as warning from '../src/utils/warning';

describe("createStore", () => {
  test("creteStore should be defined", () => {
    expect(createStore).toBeDefined();
  });

  it("exposes the public API", () => {
    const store = createStore(models);
    const methods = Reflect.ownKeys(store);

    expect(methods).toContain("Provider");
    expect(methods).toContain("useModel");
    expect(methods).toContain("getModel");
    expect(methods).toContain("withModel");
    expect(methods).toContain("useModelDispatchers");
    expect(methods).toContain("withModelDispatchers");
    expect(methods).toContain("useModelEffectsState");
    expect(methods).toContain("withModelEffectsState");
    expect(methods).toContain("getModelState");
    expect(methods).toContain("getModelDispatchers");
  });

  it("create unsupported effects should console error", () => {
    const spy = jest.spyOn(warning, "default");
    createStore({ counterWithUnsupportEffects });
    expect(spy).toHaveBeenCalled();
  });

  describe("Provider", () => {
    afterEach(() => rtl.cleanup());
    const store = createStore(models);
    const { Provider } = store;

    it("should not enforce one child", () => {
      expect(() =>
        rtl.render(
          <Provider>
            <div />
          </Provider>,
        ),
      ).not.toThrow();

      expect(() =>
        rtl.render(
          <Provider>
            <div />
            <div />
          </Provider>,
        ),
      ).not.toThrow();
    });
  });

  const renderHook = (callback, namespace, Provider, initialStates?: any) => {
    return rhl.renderHook(() => callback(namespace), {
      wrapper: (props) => (
        <Provider {...props} initialStates={initialStates}>
          {props.children}
        </Provider>
      ),
    });
  };

  describe("function component model", () => {
    const mockIcestoreApi = {
      createStore,
    };
    const spy = jest.spyOn(mockIcestoreApi, 'createStore');

    afterEach(rhl.cleanup);

    it("throw error when trying to use the inexisted model", () => {
      const store = mockIcestoreApi.createStore(models);
      const { Provider, useModel } = store;
      const namespace = "test";
      const { result } = renderHook(useModel, namespace, Provider);
      expect(result.error).toEqual(
        Error(`Not found model by namespace: ${namespace}.`),
      );
    });

    describe("passes the initial states", () => {
      const store = mockIcestoreApi.createStore(models);
      const { Provider, useModel } = store;
      const initialStates = {
        todos: {
          dataSource: [{ name: 'test', done: true }],
        },
        user: {
          dataSource: [{ name: "test" }],
        },
      };

      it("the models states should equal to the initialStates ", () => {
        const { result: todosResult } = renderHook(useModel, "todos", Provider, initialStates);
        const { result: userResult } = renderHook(useModel, "user", Provider, initialStates);
        const [todosState] = todosResult.current;
        const [userState] = userResult.current;
        expect(todosState).toEqual(initialStates.todos);
        expect(userState).toEqual(initialStates.user);

        spy.mockRestore();
      });

      it('applies the reducer to the initial states', async () => {
        const { result } = renderHook(useModel, "todos", Provider);

        const [state, dispatchers] = result.current;
        const todos = models.todos;

        expect(state).toEqual(initialStates.todos);
        expect(Reflect.ownKeys(dispatchers)).toEqual([
          ...Reflect.ownKeys(todos.reducers),
          ...Reflect.ownKeys(todos.effects(jest.fn)),
        ]);

        rhl.act(() => {
          dispatchers.add({
            todo: { name: 'testReducers', done: false },
            currentLength: result.current.state.dataSource.length,
          });
        });

        expect(result.current[0].dataSource).toEqual(
          [
            { name: 'test', done: true },
            { name: 'testReducers', done: false },
          ],
        );

        spy.mockRestore();
      });
    });

    describe("not pass the initial states", () => {
      const store = mockIcestoreApi.createStore(models);
      const { Provider, useModel, useModelEffectsState } = store;

      it("not pass the initial states", () => {
        const { result: todosResult } = renderHook(useModel, "todos", Provider);
        const { result: userResult } = renderHook(useModel, "user", Provider);
        const [todosState] = todosResult.current;
        const [userState] = userResult.current;
        expect(todosState).toEqual({
          dataSource: [
            { name: 'Init', done: false },
          ],
        });
        expect(userState).toEqual({
          dataSource: { name: 'testName' },
          todos: 1,
          auth: false,
        });

        spy.mockRestore();
      });

      it('applies the reducer to the previous state', async () => {
        const { result } = renderHook(useModel, "todos", Provider);

        const [state, dispatchers] = result.current;
        const todos = models.todos;

        expect(state).toEqual(todos.state);
        expect(Reflect.ownKeys(dispatchers)).toEqual([
          ...Reflect.ownKeys(todos.reducers),
          ...Reflect.ownKeys(todos.effects(jest.fn)),
        ]);

        rhl.act(() => {
          dispatchers.addTodo({
            todo: { name: 'testReducers', done: false },
            currentLength: result.current.state.dataSource.length,
          });
        });

        expect(result.current[0].dataSource).toEqual(
          [
            { name: 'Init', done: false },
            { name: 'testReducers', done: false },
          ],
        );

        spy.mockRestore();
      });

      it('get model effects state', async () => {
        //  Define a new hooks  for that renderHook api doesn't support render one more hooks 
        function useModelEffect(namespace) {
          const [state, dispatchers] = useModel(namespace);
          const effectsState = useModelEffectsState(namespace);

          return { state, dispatchers, effectsState };
        }

        const { result, waitForNextUpdate } = renderHook(useModelEffect, 'todos', Provider);

        expect(result.current.state.dataSource).toEqual(models.todos.state.dataSource);
        rhl.act(() => {
          result.current.dispatchers.delete({
            index: 1,
            currentLength: result.current.state.dataSource.length,
          });
        });

        expect(result.current.effectsState.delete).toEqual({ isLoading: true, error: null });

        await waitForNextUpdate();

        expect(result.current.state.dataSource).toEqual([]);
        expect(result.current.effectsState.delete).toEqual({ isLoading: false, error: null });

        spy.mockRestore();
      });
    });
  });

  describe("class component model", () => {
    afterEach(() => {
      rtl.cleanup();
    });

    describe("passes the initial states", () => {
      const initialStates = { counter: { count: 5 } };
      const store = createStore({ counter: counterModel });
      const { Provider, withModel } = store;

      const WithModelCounter = withModel('counter')(Counter);

      it('the counter model state should equal to the initialStates ', () => {
        const tester = rtl.render(<Provider initialStates={initialStates}><WithModelCounter /></Provider>);
        const { getByTestId } = tester;
        expect(getByTestId('count').innerHTML).toBe('5');
      });

      it('applies the reducer to the initial states', () => {
        const tester = rtl.render(<Provider initialStates={initialStates}><WithModelCounter /></Provider>);
        const { getByTestId } = tester;
        expect(getByTestId('count').innerHTML).toBe('5');

        rtl.fireEvent.click(getByTestId('setState'));
        expect(getByTestId('count').innerHTML).toBe('1');

        rtl.fireEvent.click(getByTestId('decrement'));
        expect(getByTestId('count').innerHTML).toBe('0');
      });
    });

    describe("not passes the initial states", () => {
      const store = createStore({ counter: counterModel });
      const { Provider, withModel, withModelDispatchers, withModelEffectsState } = store;

      const WithModelCounter = withModel('counter')(Counter);
      const WithCounterUseDispathcers = withModelDispatchers('counter')(CounterUseDispathcers);
      const WithCounterUseEffectsState = withModelEffectsState('counter')(CounterUseEffectsState);

      it('the counter model state should equal to the previous state', () => {
        const tester = rtl.render(<Provider><WithModelCounter /></Provider>);
        const { getByTestId } = tester;
        expect(getByTestId('count').innerHTML).toBe('0');
      });

      it('applies the reducer to the previous states', () => {
        const tester = rtl.render(<Provider><WithModelCounter /></Provider>);
        const { getByTestId } = tester;
        expect(getByTestId('count').innerHTML).toBe('0');

        rtl.fireEvent.click(getByTestId('setState'));
        expect(getByTestId('count').innerHTML).toBe('1');

        rtl.fireEvent.click(getByTestId('decrement'));
        expect(getByTestId('count').innerHTML).toBe('0');
      });

      it('withDispatchers', () => {
        const tester = rtl.render(
          <Provider>
            <WithModelCounter>
              <WithCounterUseDispathcers />
            </WithModelCounter>
          </Provider>,
        );
        const { getByTestId } = tester;
        expect(getByTestId('count').innerHTML).toBe('0');

        rtl.fireEvent.click(getByTestId('increment'));
        expect(getByTestId('count').innerHTML).toBe('1');

        rtl.fireEvent.click(getByTestId('reset'));
        expect(getByTestId('count').innerHTML).toBe('0');
      });

      it('withModelEffectsState', async () => {
        const container = (
          <Provider>
            <WithCounterUseEffectsState>
              <WithModelCounter />
            </WithCounterUseEffectsState>
          </Provider>
        );
        const tester = rtl.render(container);
        const { getByTestId } = tester;

        expect(getByTestId('count').innerHTML).toBe('0');
        rtl.fireEvent.click(getByTestId('decrementAsync'));
        await rtl.waitForDomChange();
        expect(JSON.parse(getByTestId('decrementAsyncEffectsState').innerHTML).error).not.toBeNull();

        rtl.fireEvent.click(getByTestId('increment'));
        expect(getByTestId('count').innerHTML).toBe('1');

        rtl.fireEvent.click(getByTestId('decrementAsync'));
        expect(getByTestId('decrementAsyncEffectsState').innerHTML).toBe('{"isLoading":true,"error":null}');

        await rtl.waitForDomChange();
        expect(getByTestId('decrementAsyncEffectsState').innerHTML).toBe('{"isLoading":false,"error":null}');
        expect(getByTestId('count').innerHTML).toBe('0');
      });
    });
  });

  describe("get model api", () => {
    afterEach(rtl.cleanup);

    const store = createStore({ counter: counterModel });

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
    it('should set counter to updated initial value', () => {
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
  });

  describe("createStore options", () => {
    const mockFn = jest
      .fn()
      .mockReturnValueOnce(createStore(models, {
        disableLoading: true,
      }))
      .mockReturnValueOnce(createStore(models, {
        disableError: true,
      }))
      .mockReturnValueOnce(createStore({ counterWithNoImmer }, {
        disableImmer: true,
      }));

    afterEach(() => {
      rhl.cleanup();
    });

    it("disableLoading", () => {
      const store = mockFn();
      const methods = Reflect.ownKeys(store);

      expect(methods).not.toContain("useModelEffectsLoading");
      expect(methods).not.toContain("withModelEffectsLoading");
    });

    it("disableError", () => {
      const store = mockFn();
      const methods = Reflect.ownKeys(store);

      expect(methods).not.toContain("useModelEffectsError");
      expect(methods).not.toContain("withModelEffectsError");
    });

    it("disableImmer", () => {
      const store = mockFn();
      const { Provider, useModel } = store;
      const { result } = renderHook(useModel, "counterWithNoImmer", Provider);

      const [state, dispatchers] = result.current;
      expect(state).toEqual(counterWithNoImmer.state);
      rhl.act(() => {
        dispatchers.increment();
      });
      expect(result.current[0]).toEqual(2);
    });
  });
});
