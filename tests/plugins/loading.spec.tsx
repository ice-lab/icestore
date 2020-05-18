import React from 'react';
import * as rhl from "@testing-library/react-hooks";
import * as rtl from "@testing-library/react";
import createHook from '../helpers/createHook';
import createLoadingPlugin from '../../src/plugins/loading';
import createStore from "../../src/index";
import counter from '../helpers/counter';
import Counter, { CounterUseEffectsLoading } from '../helpers/CounterClassComponent';

describe('loadingPlugin', () => {
  describe('validate config', () => {
    test('should not throw error when not passing config', () => {
      expect(() => createLoadingPlugin()).not.toThrow();
    });

    test('throw an error when the type of name is not string', () => {
      const config = { name: 1 } as any;
      expect(() => createLoadingPlugin(config)).toThrow(/loading plugin config name must be a string/);
    });

    test('throw an error when the type of asNumber is not boolean', () => {
      const config = { asNumber: 1 } as any;
      expect(() => createLoadingPlugin(config)).toThrow(/loading plugin config asNumber must be a boolean/);
    });

    test('throw an error when the whitelist is not an array', () => {
      const config = { whitelist: 'whitelist' } as any;
      expect(() => createLoadingPlugin(config)).toThrow(/loading plugin config whitelist must be an array of strings/);
    });

    test('throw an error when the blacklist is not an array', () => {
      const config = { blacklist: 'blacklist' } as any;
      expect(() => createLoadingPlugin(config)).toThrow(/loading plugin config blacklist must be an array of strings/);
    });

    test('throw an error when pass both the whitelist and the blacklist', () => {
      const config = { blacklist: [], whitelist: [] } as any;
      expect(() => createLoadingPlugin(config)).toThrow(/loading plugin config cannot have both a whitelist & a blacklist/);
    });
  });

  describe('loading effects in function component', () => {
    const store = createStore({ counter });
    const { Provider, useModel, useModelEffectsLoading } = store;

    function useModelLoading(namespace) {
      const [state, dispatchers] = useModel(namespace);
      const effectsLoading = useModelEffectsLoading(namespace);

      return { state, dispatchers, effectsLoading };
    }
    test('normal usage', async () => {
      const { result, waitForNextUpdate } = createHook(Provider, useModelLoading, "counter");
      expect(result.current.effectsLoading.asyncIncrement).toBeFalsy();
      rhl.act(() => {
        result.current.dispatchers.asyncIncrement();
      });
      expect(result.current.effectsLoading.asyncIncrement).toBeTruthy();
      await waitForNextUpdate();
      expect(result.current.effectsLoading.asyncIncrement).toBeFalsy();
    });

    test('take latest effects loading', async () => {
      const { result, waitForNextUpdate } = createHook(Provider, useModelLoading, "counter");
      expect(result.current.effectsLoading.asyncIncrement).toBeFalsy();
      rhl.act(() => {
        result.current.dispatchers.asyncIncrement();
        result.current.dispatchers.asyncIncrement();
      });
      expect(result.current.effectsLoading.asyncIncrement).toBeTruthy();
      await waitForNextUpdate({ timeout: 180 });
      expect(result.current.effectsLoading.asyncIncrement).toBeFalsy();
    });

    test('multiple effects loading', async () => {
      const { result, waitForNextUpdate } = createHook(Provider, useModelLoading, "counter");
      expect(result.current.effectsLoading.asyncIncrement).toBeFalsy();
      expect(result.current.effectsLoading.asyncDecrement).toBeFalsy();
      rhl.act(() => {
        result.current.dispatchers.asyncIncrement();
        result.current.dispatchers.asyncDecrement();
      });
      expect(result.current.effectsLoading.asyncIncrement).toBeTruthy();
      expect(result.current.effectsLoading.asyncDecrement).toBeTruthy();
      await waitForNextUpdate();
      expect(result.current.effectsLoading.asyncIncrement).toBeFalsy();
      expect(result.current.effectsLoading.asyncDecrement).toBeFalsy();
    });

    test('throw error', async () => {
      const { result, waitForNextUpdate } = createHook(Provider, useModelLoading, "counter");
      expect(result.current.effectsLoading.throwError).toBeFalsy();
      rhl.act(() => {
        result.current.dispatchers.throwError();
      });
      expect(result.current.effectsLoading.throwError).toBeTruthy();
      await waitForNextUpdate();
      expect(result.current.effectsLoading.throwError).toBeFalsy();
    });
  });

  describe('loading effects in class component', () => {
    const store = createStore({ counter });
    const { Provider, withModel, withModelEffectsLoading } = store;
    const WithModelCounter = withModel('counter')(Counter);
    const WithCounterUseEffectsLoading = withModelEffectsLoading('counter')(CounterUseEffectsLoading);

    test('normal usage', done => {
      const tester = rtl.render(
        <Provider>
          <WithCounterUseEffectsLoading>
            <WithModelCounter />
          </WithCounterUseEffectsLoading>
        </Provider>,
      );
      const { getByTestId } = tester;
      expect(getByTestId('asyncIncrementEffectsLoading').innerHTML).toBe('false');

      rtl.fireEvent.click(getByTestId('asyncIncrement'));
      expect(getByTestId('asyncIncrementEffectsLoading').innerHTML).toBe('true');

      setTimeout(() => {
        expect(getByTestId('asyncIncrementEffectsLoading').innerHTML).toBe('false');
        done();
      }, 200);
    });

    test('take latest effects loading', (done) => {
      const tester = rtl.render(
        <Provider>
          <WithCounterUseEffectsLoading>
            <WithModelCounter />
          </WithCounterUseEffectsLoading>
        </Provider>,
      );
      const { getByTestId } = tester;
      expect(getByTestId('asyncIncrementEffectsLoading').innerHTML).toBe('false');

      rtl.fireEvent.click(getByTestId('asyncIncrement'));
      rtl.fireEvent.click(getByTestId('asyncIncrement'));
      expect(getByTestId('asyncIncrementEffectsLoading').innerHTML).toBe('true');

      setTimeout(() => {
        expect(getByTestId('asyncIncrementEffectsLoading').innerHTML).toBe('false');
        done();
      }, 180);
    });

    test('multiple effects loading', (done) => {
      const tester = rtl.render(
        <Provider>
          <WithCounterUseEffectsLoading>
            <WithModelCounter />
          </WithCounterUseEffectsLoading>
        </Provider>,
      );
      const { getByTestId } = tester;
      expect(getByTestId('asyncIncrementEffectsLoading').innerHTML).toBe('false');

      rtl.fireEvent.click(getByTestId('asyncIncrement'));
      rtl.fireEvent.click(getByTestId('asyncDecrement'));
      expect(getByTestId('asyncIncrementEffectsLoading').innerHTML).toBe('true');
      expect(getByTestId('asyncDecrementEffectsLoading').innerHTML).toBe('true');

      setTimeout(() => {
        expect(getByTestId('asyncIncrementEffectsLoading').innerHTML).toBe('false');
        expect(getByTestId('asyncDecrementEffectsLoading').innerHTML).toBe('false');
        done();
      }, 200);
    });

    test('throw error', (done) => {
      const tester = rtl.render(
        <Provider>
          <WithCounterUseEffectsLoading>
            <WithModelCounter />
          </WithCounterUseEffectsLoading>
        </Provider>,
      );
      const { getByTestId } = tester;
      expect(getByTestId('throwErrorEffectsLoading').innerHTML).toBe('false');
      rtl.fireEvent.click(getByTestId('throwError'));
      expect(getByTestId('throwErrorEffectsLoading').innerHTML).toBe('true');

      setTimeout(() => {
        expect(getByTestId('throwErrorEffectsLoading').innerHTML).toBe('false');
        done();
      }, 200);
    });
  });
});
