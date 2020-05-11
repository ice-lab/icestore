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
    afterEach(rtl.cleanup);
    const store = createStore({ counter });
    const { Provider, useModel, useModelEffectsError } = store;

    function useModelError(namespace) {
      const [state, dispatchers] = useModel(namespace);
      const effectsError = useModelEffectsError(namespace);

      return { state, dispatchers, effectsError };
    }

    test('normal', async () => {
      const { result, waitForNextUpdate } = createHook(Provider, useModelError, "counter");
      expect(result.current.effectsError.throwError).toEqual({ error: null, value: false });
      rhl.act(() => {
        result.current.dispatchers.throwError();
      });
      await waitForNextUpdate({ timeout: 200 });
      expect(result.current.effectsError.throwError).toEqual({ error: Error('Error!'), value: true });
    });

    test('take latest effects error', async () => {
      const { result, waitForNextUpdate } = createHook(Provider, useModelError, "counter");

      rhl.act(() => {
        result.current.dispatchers.throwError('1');
        result.current.dispatchers.throwError('2');
      });
      await waitForNextUpdate({ timeout: 200 });
      expect(result.current.effectsError.throwError).toEqual({ error: Error('2'), value: true });
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
      expect(getByTestId('throwErrorEffectsErrorValue').innerHTML).toEqual('false');
      expect(getByTestId('throwErrorEffectsErrorMessage').innerHTML).toEqual('null');

      rtl.fireEvent.click(getByTestId('throwError'));
      await rtl.waitForDomChange({ timeout: 200 });

      expect(getByTestId('throwErrorEffectsErrorValue').innerHTML).toEqual('true');
      expect(getByTestId('throwErrorEffectsErrorMessage').innerHTML).toEqual('Error: Error!');
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
