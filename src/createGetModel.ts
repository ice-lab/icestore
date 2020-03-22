import Dispatcher from './dispatcher';

export default function(dispatcher: Dispatcher) {
  return function(namespace: string) {
    return dispatcher.data[namespace];
  };
}
