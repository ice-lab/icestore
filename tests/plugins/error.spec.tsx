import React from 'react';
import * as rhl from "@testing-library/react-hooks";
import * as rtl from "@testing-library/react";
import createErrorPlugin from '../../src/plugins/error';
import createStore from "../../src/index";
import counter from '../helpers/counter';
import Counter, { CounterUseEffectsError } from '../helpers/CounterClassComponent';

describe('createErrorPlugin', () => {
  describe('validate config', () => {
    test('should not throw error when not passing config', () => {
      expect(() => createErrorPlugin()).not.toThrow();
    });

    test('throw an error when the type of name is not string', () => {
      const config = { name: 1 } as any;
      expect(() => createErrorPlugin(config)).toThrow(/error plugin config name must be a string/);
    });

    test('throw an error when the type of asNumber is not boolean', () => {
      const config = { asNumber: 1 } as any;
      expect(() => createErrorPlugin(config)).toThrow(/error plugin config asNumber must be a boolean/);
    });

    test('throw an error when the whitelist is not an array', () => {
      const config = { whitelist: 'whitelist' } as any;
      expect(() => createErrorPlugin(config)).toThrow(/error plugin config whitelist must be an array of strings/);
    });

    test('throw an error when the blacklist is not an array', () => {
      const config = { blacklist: 'blacklist' } as any;
      expect(() => createErrorPlugin(config)).toThrow(/error plugin config blacklist must be an array of strings/);
    });

    test('throw an error when pass both the whitelist and the blacklist', () => {
      const config = { blacklist: [], whitelist: [] } as any;
      expect(() => createErrorPlugin(config)).toThrow(/error plugin config cannot have both a whitelist & a blacklist/);
    });
  });

  describe('error effects in function component', () => {
    test('normal', () => {
      const store = createStore({ counter });
      const { Provider, useModel, useModelEffectsError } = store;

      function useModelError(namespace) {
        const [state, dispatchers] = useModel(namespace);
        const effectsError = useModelEffectsError(namespace);

        return { state, dispatchers, effectsError };
      }

      const { result } = createHook(Provider, useModelError, "counter");
      const { dispatchers } = result.current;

      expect(result.current.effectsError.asyncDecrement).toEqual({ error: null, value: false });

      rhl.act(() => {
        dispatchers.asyncDecrement();
      });
      // expect(result.current.effectsError.asyncDecrement).toEqual({ error: Error('count should be greater than or equal to 0'), value: true });
    });
  });

  describe('error effects in class component', () => {
    const store = createStore({ counter });
    const { Provider, withModel, withModelEffectsError } = store;
    const WithModelCounter = withModel('counter')(Counter);
    const WithCounterUseEffectsError = withModelEffectsError('counter')(CounterUseEffectsError);

    test('normal', async () => {
      const tester = rtl.render(
        <Provider>
          <WithCounterUseEffectsError>
            <WithModelCounter />
          </WithCounterUseEffectsError>
        </Provider>,
      );
      const { getByTestId } = tester;
      expect(JSON.parse(getByTestId('asyncDecrementEffectsError').innerHTML)).toEqual({ error: null, value: false });

      rtl.fireEvent.click(getByTestId('asyncDecrement'));
      await rtl.waitForDomChange();

      expect(JSON.parse(getByTestId('asyncDecrementEffectsError').innerHTML)).toEqual({ error: {}, value: true });
    });
  });
});

function createHook(Provider, callback, namespace) {
  return rhl.renderHook(() => callback(namespace), {
    wrapper: (props) => (
      <Provider {...props}>
        {props.children}
      </Provider>
    ),
  });
}
