import React from 'react';
import * as rtl from "@testing-library/react";
import counter from '../helpers/counter';
import Counter from '../helpers/CounterClassComponent';
import createStore from "../../src/index";
import createHook from '../helpers/createHook';

describe('providerPlugin', () => {
  const store = createStore({ counter });
  const { Provider, useModel, withModel } = store;
  afterEach(() => rtl.cleanup());

  it('should not enforce one child', () => {
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
    const { result } = createHook(Provider, useModel, "counter");
    const [state] = result.current;
    expect(state.count).toEqual(0);
  });

  it('should add the store to class component context', () => {
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
    const { result } = createHook(Provider, useModel, "counter", initialStates);
    const [state] = result.current;
    expect(state).toEqual(initialStates.counter);
  });

  it('pass the initialStates to the class component', () => {
    const WithModelCounter = withModel('counter')(Counter);

    const tester = rtl.render(<Provider initialStates={initialStates}><WithModelCounter /></Provider>);
    const { getByTestId } = tester;
    expect(getByTestId('count').innerHTML).toBe('10');
  });
});
