import React, { PureComponent } from 'react';
import {
  ExtractIModelFromModelConfig,
  ExtractIModelDispatchersFromModelConfig,
  ExtractIModelEffectsStateFromModelConfig,
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
        <div data-testid="asyncDecrement" onClick={dispatchers.asyncDecrement} />
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

interface CounterUseEffectsStateProps {
  counterEffectsState: ExtractIModelEffectsStateFromModelConfig<typeof counterModel>;
  children: React.ReactChild;
}
export class CounterUseEffectsState extends PureComponent<CounterUseEffectsStateProps> {
  render() {
    const { counterEffectsState, children } = this.props;
    return (
      <React.Fragment>
        <code data-testid="decrementAsyncEffectsState">
          {JSON.stringify(counterEffectsState.asyncDecrement)}
        </code>
        {children}
      </React.Fragment>
    );
  }
}
