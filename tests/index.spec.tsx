/* eslint-disable react/jsx-filename-extension */
import React, { PureComponent } from "react";
import * as rhl from "@testing-library/react-hooks";
import * as rtl from "@testing-library/react";
import { createStore } from "../src/index";
import * as models from "./helpers/models";
import { todosWithUnsupportEffects } from "./helpers/todos";
import counterModel from './helpers/counter';
import {
  ExtractIModelFromModelConfig,
  ExtractIModelDispatchersFromModelConfig,
  ExtractIModelEffectsLoadingFromModelConfig,
  ExtractIModelEffectsErrorFromModelConfig,
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
    const { Provider, useModel } = store;

    it("throw error when trying to use the inexisted model", () => {
      const namespace: any = "test";
      const { result } = rhl.renderHook(() => useModel(namespace), {
        wrapper: (props) => <Provider {...props}>{props.children}</Provider>,
      });
      // expect(result.error).toEqual(
      //   Error(`Not found model by namespace: ${namespace}.`)
      // );
    });

    it("passes the initial state", () => {
      const initialState = {
        todos: { title: "Foo", done: true },
        user: { name: "test" },
      };
      const wrapper = (props) => (
        <Provider {...props} initialState={initialState}>
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
      expect(todosState).toBe(initialState.todos);
      expect(userState).toBe(initialState.user);
    });
  });

  describe("class component model", () => {
    afterEach(() => rtl.cleanup());
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
        const [state, actions] = counter;
        const { count } = state;
        return (
          <React.Fragment>
            <div data-testid="count">{count}</div>
            <div data-testid="increment" onClick={() => actions.increment()} />
            <div data-testid="decrement" onClick={() => actions.decrement()} />
            <div data-testid="decrementAsync" onClick={() => actions.decrementAsync()} />
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
      counterEffectsLoading: ExtractIModelEffectsLoadingFromModelConfig<typeof counterModel>;
      counterEffectsError: ExtractIModelEffectsErrorFromModelConfig<typeof counterModel>;
      children: React.ReactChild;
    }
    class CounterLoadingWrapper extends PureComponent<CounterLoadingWrapperProps> {
      render() {
        const { counterEffectsLoading, counterEffectsError, children } = this.props;
        return (
          <React.Fragment>
            <code data-testid="decrementAsyncLoading">
              {JSON.stringify(counterEffectsLoading.decrementAsync)}
            </code>
            <code data-testid="decrementAsyncError">
              {JSON.stringify(counterEffectsError.decrementAsync)}
            </code>
            {children}
          </React.Fragment>
        );
      }
    };
    const WithModelCounter = withModel('counter')(Counter);
    const WithDispatchersCounterReset = withModelDispatchers('counter')(CounterReset);
    const WithModelEffectsStateCounterWrapper = withModelEffectsState('counter')(CounterLoadingWrapper);

    it('passes the initial state', () => {
      const initialState = { counter: { count: 5 } };
      const tester = rtl.render(<Provider initialState={initialState}><WithModelCounter /></Provider>);
      const { getByTestId } = tester;
      expect(getByTestId('count').innerHTML).toBe('5');
    });

    it('not pass the initial state', () => {
      const tester = rtl.render(<Provider><WithModelCounter /></Provider>);
      const { getByTestId } = tester;
      expect(getByTestId('count').innerHTML).toBe('0');
    });

    it('applies the reducer to the initial state', () => {
      const initialState = { counter: { count: 5 } };
      const tester = rtl.render(<Provider initialState={initialState}><WithModelCounter /></Provider>);
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
  });

  describe("getModel", () => {

  });

  // describe("useModelDispatchers", () => { });

  // describe("useModelEffectsState", () => { });

  // describe("withModelDispatchers", () => { });

  // describe("withModelEffectsState", () => { });

  // describe("getModelState", () => { });

  // describe("getModelDispatchers", () => { });

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
