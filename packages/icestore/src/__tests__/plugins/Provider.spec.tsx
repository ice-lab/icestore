import React from 'react';
import * as rtl from "@testing-library/react";
import counter from '../helpers/counter';
import Counter from '../helpers/CounterClassComponent';
import createStore from "../../index";
import createHook from '../helpers/createHook';

describe('providerPlugin', () => {
  afterEach(() => rtl.cleanup());

  it('should not enforce one child', () => {
    const store = createStore({ counter });
    const { Provider } = store;
    expect(() => {
      rtl.render(
        <Provider>
          <div />
        </Provider>,
      );
    }).not.toThrow();

    expect(() => {
      rtl.render(
        <Provider>
          <div />
          <div />
        </Provider>,
      );
    }).not.toThrow();
  });

  it('should add the store to function component context', () => {
    const store = createStore({ counter });
    const { Provider, useModel } = store;

    const { result } = createHook(Provider, useModel, "counter");
    const [state] = result.current;
    expect(state.count).toEqual(0);
  });

  it('should add the store to class component context', () => {
    const store = createStore({ counter });
    const { Provider, withModel } = store;

    const WithModelCounter = withModel('counter')(Counter);

    const tester = rtl.render(<Provider><WithModelCounter /></Provider>);
    const { getByTestId } = tester;
    expect(getByTestId('count').innerHTML).toBe('0');
  });

  const initialStates = {
    counter: {
      count: 10,
    },
  };

  it('pass the initialStates to the function component', () => {
    const store = createStore({ counter });
    const { Provider, useModel } = store;

    const { result } = createHook(Provider, useModel, "counter", initialStates);
    const [state] = result.current;
    expect(state).toEqual(initialStates.counter);
  });

  it('pass the initialStates to the class component', () => {
    const store = createStore({ counter });
    const { Provider, withModel } = store;

    const WithModelCounter = withModel('counter')(Counter);

    const tester = rtl.render(<Provider initialStates={initialStates}><WithModelCounter /></Provider>);
    const { getByTestId } = tester;
    expect(getByTestId('count').innerHTML).toBe('10');
  });
});
