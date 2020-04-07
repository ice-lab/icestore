/* eslint-disable react/jsx-filename-extension */
import React, { PureComponent } from "react";
import * as rhl from "@testing-library/react-hooks";
import * as rtl from "@testing-library/react";
import { createStore } from "../src";
import * as models from "./helpers/models";
import { todosWithUnsupportEffects } from "./helpers/todos";
import counterModel from './helpers/counter';
import {
  ExtractIModelFromModelConfig,
  ExtractIModelDispatchersFromModelConfig,
  ExtractIModelEffectsLoadingFromModelConfig,
  ExtractIModelEffectsErrorFromModelConfig,
  ExtractIModelEffectsStateFromModelConfig,
} from '../src/types';

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
    const spy = jest.spyOn(console, "error");
    createStore({ todosWithUnsupportEffects });
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

  describe("function component model", () => {
    afterEach(() => rhl.cleanup());

    const store = createStore(models);
    const { Provider, useModel, useModelEffectsState } = store;

    it("throw error when trying to use the inexisted model", () => {
      const namespace: any = "test";
      const { result } = rhl.renderHook(() => useModel(namespace), {
        wrapper: (props) => <Provider {...props}>{props.children}</Provider>,
      });
      expect(result.error).toEqual(
        Error(`Not found model by namespace: ${namespace}.`),
      );
    });

    // it("passes the initial state", () => {
    //   const initialStates = {
    //     todos: {
    //       dataSource: [
    //         { name: 'test', done: true },
    //       ],
    //     },
    //     user: { dataSource: [{ name: "test" }] },
    //   };
    //   const wrapper = (props) => (
    //     <Provider {...props} initialStates={initialStates}>
    //       {props.children}
    //     </Provider>
    //   );
    //   const { result: todosResult } = rhl.renderHook(() => useModel("todos"), {
    //     wrapper,
    //   });
    //   const { result: userResult } = rhl.renderHook(() => useModel("user"), {
    //     wrapper,
    //   });
    //   const [todosState] = todosResult.current;
    //   const [userState] = userResult.current;
    //   expect(todosState).toEqual(initialStates.todos);
    //   expect(userState).toEqual(initialStates.user);
    // });

    it("not pass the initial state", () => {
      const wrapper = (props) => (
        <Provider {...props}>
          {props.children}
        </Provider>
      );
      const { result: todosResult } = rhl.renderHook(() => useModel("todos"), {
        wrapper,
      });
      const { result: userResult } = rhl.renderHook(() => useModel("user"), {
        wrapper,
      });
      const [todosState] = todosResult.current;
      const [userState] = userResult.current;
      expect(todosState).toEqual({
        dataSource: [
          {
            name: 'Init',
            done: false,
          },
        ],
      });
      expect(userState).toEqual({
        dataSource: { name: 'testName' },
        todos: 1,
        auth: false,
      });
    });

    it('applies the reducer to the previous state', async () => {
      const { result, waitForNextUpdate } = rhl.renderHook(() => useModel("todos"), {
        wrapper: props => (
          <Provider {...props}>
            {props.children}
          </Provider>
        ),
      });

      const [state, dispatchers] = result.current;
      const todos = models.todos;

      expect(state).toEqual(todos.state);
      expect(Reflect.ownKeys(dispatchers)).toEqual([
        ...Reflect.ownKeys(todos.reducers),
        ...Reflect.ownKeys(todos.effects(undefined)),
      ]);

      rhl.act(() => {
        dispatchers.addTodo({ name: 'testReducers', done: false });
      });

      expect(result.current[0].dataSource).toEqual(
        [
          { name: 'Init', done: false },
          { name: 'testReducers', done: false },
        ],
      );
      rhl.act(() => {
        dispatchers.add(store, { name: 'testEffects', done: false });
      });
      expect(result.current[0].dataSource).toEqual(
        [
          { name: 'Init', done: false },
          { name: 'testReducers', done: false },
          { name: 'testEffects', done: false },
        ],
      );
      await waitForNextUpdate();

      expect(result.current[0].dataSource).toEqual(
        [
          { name: 'Init', done: false },
          { name: 'testReducers', done: false },
          { name: 'testEffects', done: false },
        ],
      );
    });

    it('get model effects state', async () => {
      const initialStates = {
        todos: {
          dataSource: [{
            title: 'Foo',
            done: true,
          }],
        },
      };
      const wrapper = props => <Provider {...props} initialStates={initialStates}>{props.children}</Provider>;

      //  Define a new hooks  for that renderHook api doesn't support render one more hooks 
      function useModelEffect() {
        const [state, dispatchers] = useModel("todos");
        const effectsState = useModelEffectsState('todos');

        return { state, dispatchers, effectsState };
      }

      const { result, waitForNextUpdate } = rhl.renderHook(() => useModelEffect(), { wrapper });

      expect(result.current.state.dataSource).toEqual(initialStates.todos.dataSource);
      rhl.act(() => {
        result.current.dispatchers.delete(store, 1);
      });

      expect(result.current.effectsState.delete).toEqual({ isLoading: true, error: null });

      await waitForNextUpdate();

      expect(result.current.state.dataSource).toEqual([]);
      expect(result.current.effectsState.delete).toEqual({ isLoading: false, error: null });
    });
  });

  describe("class component model", () => {
    afterEach(() => {
      rtl.cleanup();
    });
    const store = createStore({ counter: counterModel });
    const {
      Provider,
      withModel,
      withModelDispatchers,
      withModelEffectsState,
      withModelEffectsError,
      withModelEffectsLoading,
    } = store;

    interface CounterProps {
      counter: ExtractIModelFromModelConfig<typeof counterModel>;
      children: React.ReactNode;
    }

    class Counter extends PureComponent<CounterProps> {
      render() {
        const { counter, children } = this.props;
        const [state, dispatchers] = counter;
        const { count } = state;
        return (
          <React.Fragment>
            <div data-testid="count">{count}</div>
            <div data-testid="increment" onClick={dispatchers.increment} />
            <div data-testid="decrement" onClick={dispatchers.decrement} />
            <div data-testid="decrementAsync" onClick={dispatchers.decrementAsync} />
            {children}
          </React.Fragment>
        );
      }
    }

    interface CounterResetProps {
      counterDispatchers: ExtractIModelDispatchersFromModelConfig<typeof counterModel>;
    };

    class CounterReset extends PureComponent<CounterResetProps> {
      render() {
        const { counterDispatchers } = this.props;
        return (
          <div data-testid="reset" onClick={() => counterDispatchers.reset()} />
        );
      }
    };

    interface CounterLoadingWrapperProps {
      // counterEffectsLoading: ExtractIModelEffectsLoadingFromModelConfig<typeof counterModel>;
      // counterEffectsError: ExtractIModelEffectsErrorFromModelConfig<typeof counterModel>;
      counterEffectsState: ExtractIModelEffectsStateFromModelConfig<typeof counterModel>;
      children: React.ReactChild;
    }
    class CounterLoadingWrapper extends PureComponent<CounterLoadingWrapperProps> {
      render() {
        const { counterEffectsState, children } = this.props;
        return (
          <React.Fragment>
            <code data-testid="decrementAsyncEffectsState">
              {JSON.stringify(counterEffectsState.decrementAsync)}
            </code>
            {children}
          </React.Fragment>
        );
      }
    };
    const WithModelCounter = withModel('counter')(Counter);
    const WithDispatchersCounterReset = withModelDispatchers('counter')(CounterReset);
    const WithModelEffectsStateCounterLoadingWrapper = withModelEffectsState('counter')(CounterLoadingWrapper);

    it('passes the initial state', () => {
      const initialStates = { counter: { count: 5 } };
      const tester = rtl.render(<Provider initialStates={initialStates}><WithModelCounter /></Provider>);
      const { getByTestId } = tester;
      expect(getByTestId('count').innerHTML).toBe('5');
    });

    it('not pass the initial state', () => {
      const tester = rtl.render(<Provider><WithModelCounter /></Provider>);
      const { getByTestId } = tester;
      expect(getByTestId('count').innerHTML).toBe('0');
    });

    it('applies the reducer to the initial state', () => {
      const initialStates = { counter: { count: 5 } };
      const tester = rtl.render(<Provider initialStates={initialStates}><WithModelCounter /></Provider>);
      const { getByTestId } = tester;
      expect(getByTestId('count').innerHTML).toBe('5');

      rtl.fireEvent.click(getByTestId('increment'));
      expect(getByTestId('count').innerHTML).toBe('6');

      rtl.fireEvent.click(getByTestId('decrement'));
      expect(getByTestId('count').innerHTML).toBe('5');
    });

    it('withDispatchers', () => {
      const tester = rtl.render(
        <Provider>
          <WithModelCounter>
            <WithDispatchersCounterReset />
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
          <WithModelEffectsStateCounterLoadingWrapper>
            <WithModelCounter />
          </WithModelEffectsStateCounterLoadingWrapper>
        </Provider>
      );
      const tester = rtl.render(container);
      const { getByTestId } = tester;

      expect(getByTestId('count').innerHTML).toBe('0');
      rtl.fireEvent.click(getByTestId('increment'));

      expect(getByTestId('count').innerHTML).toBe('1');
      rtl.fireEvent.click(getByTestId('decrementAsync'));

      expect(getByTestId('decrementAsyncEffectsState').innerHTML).toBe('{"isLoading":true,"error":null}');

      await rtl.waitForDomChange();
      expect(getByTestId('decrementAsyncEffectsState').innerHTML).toBe('{"isLoading":false,"error":null}');
      expect(getByTestId('count').innerHTML).toBe('0');
    });
  });

  describe("getModel", () => {

  });

  describe("disable immer", () => {
    const store = createStore(models, {
      disableImmer: true,
    });
  });

  describe("disable loading", () => {
    const store = createStore(models, {
      disableLoading: true,
    });
    const methods = Reflect.ownKeys(store);

    expect(methods).not.toContain("useModelEffectsLoading");
    expect(methods).not.toContain("withModelEffectsLoading");
  });

  describe("disable error", () => {
    const store = createStore(models, {
      disableError: true,
    });

    const methods = Reflect.ownKeys(store);

    expect(methods).not.toContain("useModelEffectsError");
    expect(methods).not.toContain("withModelEffectsError");
  });
});
