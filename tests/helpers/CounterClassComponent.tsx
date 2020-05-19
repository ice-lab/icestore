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

interface CounterUseDispathcersProps {
  counterDispatchers: ExtractIModelDispatchersFromModelConfig<typeof counterModel>;
};
export class CounterUseDispathcers extends PureComponent<CounterUseDispathcersProps> {
  render() {
    const { counterDispatchers } = this.props;
    return (
      <div data-testid="reset" onClick={() => counterDispatchers.reset()} />
    );
  }
};

interface CounterUseActionsProps {
  counterActions: ExtractIModelDispatchersFromModelConfig<typeof counterModel>;
}
export class CounterUseActions extends PureComponent<CounterUseActionsProps> {
  render() {
    const { counterActions } = this.props;
    return (
      <div data-testid="reset" onClick={() => counterActions.reset()} />
    );
  }
}

interface CounterUseEffectsStateProps {
  counterEffectsState: ExtractIModelEffectsStateFromModelConfig<typeof counterModel>;
  children: React.ReactChild;
}
export class CounterUseEffectsState extends PureComponent<CounterUseEffectsStateProps> {
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

interface CounterUseActionsStateProps {
  counterActionsState: ExtractIModelEffectsStateFromModelConfig<typeof counterModel>;
  children: React.ReactChild;
}
export class CounterUseActionsState extends PureComponent<CounterUseActionsStateProps> {
  render() {
    const { counterActionsState, children } = this.props;
    return (
      <React.Fragment>
        <span data-testid="throwErrorActionsLoading">
          {String(counterActionsState.throwError.isLoading)}
        </span>
        <span data-testid="throwErrorActionsErrorMessage">
          {String(counterActionsState.throwError.error)}
        </span>
        {children}
      </React.Fragment>
    );
  }
}

interface CounterUseEffectsLoadingProps {
  counterEffectsLoading: ExtractIModelEffectsLoadingFromModelConfig<typeof counterModel>;
  children: React.ReactChild;
}

export class CounterUseEffectsLoading extends PureComponent<CounterUseEffectsLoadingProps> {
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

interface CounterUseEffectsErrorProps {
  counterEffectsError: ExtractIModelEffectsErrorFromModelConfig<typeof counterModel>;
  children: React.ReactChild;
}

export class CounterUseEffectsError extends PureComponent<CounterUseEffectsErrorProps> {
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