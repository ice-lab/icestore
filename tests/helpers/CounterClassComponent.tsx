import React, { PureComponent } from 'react';
import {
  ExtractIModelFromModelConfig,
  ExtractIModelDispatchersFromModelConfig,
  ExtractIModelEffectsStateFromModelConfig,
  ExtractIModelEffectsLoadingFromModelConfig,
  ExtractIModelEffectsErrorFromModelConfig,
} from '../../src';
import counterModel from './counter';

interface CounterProps {
  counter: ExtractIModelFromModelConfig<typeof counterModel>;
  children: React.ReactNode;
}

export default class Counter extends PureComponent<CounterProps> {
  render() {
    const { counter, children } = this.props;
    const [state, dispatchers] = counter;
    const { count } = state;
    return (
      <React.Fragment>
        <div data-testid="count">{count}</div>
        <div data-testid="setState" onClick={() => dispatchers.setState({ count: 1 })} />
        <div data-testid="increment" onClick={dispatchers.increment} />
        <div data-testid="decrement" onClick={dispatchers.decrement} />
        <div data-testid="asyncIncrement" onClick={dispatchers.asyncIncrement} />
        <div data-testid="asyncDecrement" onClick={dispatchers.asyncDecrement} />
        <div data-testid="throwError" onClick={() => dispatchers.throwError()} />
        {children}
      </React.Fragment>
    );
  }
}

interface CounterWithDispatchersProps {
  counterDispatchers: ExtractIModelDispatchersFromModelConfig<typeof counterModel>;
};
export class CounterWithDispatchers extends PureComponent<CounterWithDispatchersProps> {
  render() {
    const { counterDispatchers } = this.props;
    return (
      <div data-testid="reset" onClick={() => counterDispatchers.reset()} />
    );
  }
};

interface CounterWithEffectsStateProps {
  counterEffectsState: ExtractIModelEffectsStateFromModelConfig<typeof counterModel>;
  children: React.ReactChild;
}
export class CounterWithEffectsState extends PureComponent<CounterWithEffectsStateProps> {
  render() {
    const { counterEffectsState, children } = this.props;
    return (
      <React.Fragment>
        <span data-testid="throwErrorEffectsLoading">
          {String(counterEffectsState.throwError.isLoading)}
        </span>
        <span data-testid="throwErrorEffectsError">
          {String(counterEffectsState.throwError.error)}
        </span>
        {children}
      </React.Fragment>
    );
  }
}

interface CounterWithEffectsLoadingProps {
  counterEffectsLoading: ExtractIModelEffectsLoadingFromModelConfig<typeof counterModel>;
  children: React.ReactChild;
}

export class CounterWithEffectsLoading extends PureComponent<CounterWithEffectsLoadingProps> {
  render() {
    const { counterEffectsLoading, children } = this.props;
    return (
      <React.Fragment>
        <span data-testid="asyncIncrementEffectsLoading">
          {String(counterEffectsLoading.asyncIncrement)}
        </span>
        <span data-testid="asyncDecrementEffectsLoading">
          {String(counterEffectsLoading.asyncDecrement)}
        </span>
        <span data-testid="throwErrorEffectsLoading">
          {String(counterEffectsLoading.throwError)}
        </span>
        {children}
      </React.Fragment>
    );
  }
}

interface CounterWithEffectsErrorProps {
  counterEffectsError: ExtractIModelEffectsErrorFromModelConfig<typeof counterModel>;
  children: React.ReactChild;
}

export class CounterWithEffectsError extends PureComponent<CounterWithEffectsErrorProps> {
  render() {
    const { counterEffectsError, children } = this.props;
    return (
      <React.Fragment>
        <span data-testid="throwErrorEffectsErrorValue">
          {String(counterEffectsError.throwError.value)}
        </span>
        <span data-testid="throwErrorEffectsErrorMessage">
          {String(counterEffectsError.throwError.error)}
        </span>
        {children}
      </React.Fragment>
    );
  }
}