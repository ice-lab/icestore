import {
  Config,
  ConfigPropTypeState,
  ModelActions,
  ModelActionsState,
} from './types';

export function transformModelState<C extends Config>(c: C): ConfigPropTypeState<C> {
  return {};
};

export function transformModelActions<C extends Config>(c: C): ModelActions<C> {
  return {};
};

export function transformModelActionsStates<C extends Config>(c: C): ModelActionsState<C> {
  return {};
};

export function transformModel<C extends Config>(c: C): [ ConfigPropTypeState<C>, ModelActions<C> ] {
  return [ transformModelState(c), transformModelActions(c) ];
}
