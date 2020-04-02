import React from 'react';
import * as T from '../types';

export interface ErrorConfig {
  name?: string;
  whitelist?: string[];
  blacklist?: string[];
  asNumber?: boolean;
}

interface IErrorState {
  error: Error;
  value: boolean;
}

export interface ErrorState<M extends T.Models> {
  error: {
    global: IErrorState;
    models: { [modelName in keyof M]: IErrorState };
    effects: {
      [modelName in keyof M]: {
        [effectName in keyof T.ExtractIModelDispatchersFromEffects<
        M[modelName]['effects']
        >]: IErrorState
      }
    };
  };
}

const defaultValue = {
  error: null,
  value: 0,
};
const cntState = {
  global: {
    ...defaultValue,
  },
  models: {},
  effects: {},
};
const nextState = {
  global: {
    ...cntState.global,
  },
  models: {
    ...cntState.models,
  },
  effects: {
    ...cntState.effects,
  },
};
function fallback(value) {
  return value < 0 ? 0 : value;
}

const createErrorAction = (converter, i) => (
  state,
  { name, action }: any,
  error: Error,
) => {
  nextState.global = {
    value: fallback(nextState.global.value + i),
    error,
  };
  if (typeof nextState.models[name] === 'undefined') {
    nextState.models[name] = {
      ...defaultValue,
    };
  }
  nextState.models[name] = {
    value: fallback(nextState.models[name].value + i),
    error,
  };
  if (typeof nextState.effects[name] === 'undefined') {
    nextState.effects[name] = {};
  }
  if (typeof nextState.effects[name][action] === 'undefined') {
    nextState.effects[name][action] = {
      ...defaultValue,
    };
  }
  nextState.effects[name][action] = {
    value: fallback(nextState.effects[name][action].value + i),
    error,
  };

  return {
    ...state,
    global: converter(nextState.global),
    models: {
      ...state.models,
      [name]: converter(nextState.models[name]),
    },
    effects: {
      ...state.effects,
      [name]: {
        ...state.effects[name],
        [action]: converter(nextState.effects[name][action]),
      },
    },
  };
};

const validateConfig = config => {
  if (config.name && typeof config.name !== 'string') {
    throw new Error('error plugin config name must be a string');
  }
  if (config.asNumber && typeof config.asNumber !== 'boolean') {
    throw new Error('error plugin config asNumber must be a boolean');
  }
  if (config.whitelist && !Array.isArray(config.whitelist)) {
    throw new Error(
      'error plugin config whitelist must be an array of strings',
    );
  }
  if (config.blacklist && !Array.isArray(config.blacklist)) {
    throw new Error(
      'error plugin config blacklist must be an array of strings',
    );
  }
  if (config.whitelist && config.blacklist) {
    throw new Error(
      'error plugin config cannot have both a whitelist & a blacklist',
    );
  }
};

export default (config: ErrorConfig = {}): T.Plugin => {
  validateConfig(config);

  const errorModelName = config.name || 'error';

  const converter =
    config.asNumber === true
      ? cnt => cnt
      : cnt => ({
        ...cnt,
        value: cnt.value > 0,
      });

  const error: T.Model = {
    name: errorModelName,
    reducers: {
      hide: createErrorAction(converter, -1),
      show: createErrorAction(converter, 1),
    },
    state: {
      ...cntState,
    },
  };

  cntState.global = {
    ...defaultValue,
  };
  error.state.global = converter(cntState.global);

  return {
    config: {
      models: {
        error,
      },
    },
    onModel({ name }: T.Model) {
      // do not run dispatch on 'error' model
      if (name === errorModelName) {
        return;
      }

      cntState.models[name] = {
        ...defaultValue,
      };
      error.state.models[name] = converter(cntState.models[name]);
      error.state.effects[name] = {};
      const modelActions = this.dispatch[name];

      // map over effects within models
      Object.keys(modelActions).forEach((action: string) => {
        if (this.dispatch[name][action].isEffect !== true) {
          return;
        }

        cntState.effects[name][action] = {
          ...defaultValue,
        };
        error.state.effects[name][action] = converter(
          cntState.effects[name][action],
        );

        const actionType = `${name}/${action}`;

        // ignore items not in whitelist
        if (config.whitelist && !config.whitelist.includes(actionType)) {
          return;
        }

        // ignore items in blacklist
        if (config.blacklist && config.blacklist.includes(actionType)) {
          return;
        }

        // copy orig effect pointer
        const origEffect = this.dispatch[name][action];

        // create function with pre & post error calls
        const effectWrapper = async (...props) => {
          // only clear when there has been a error
          if (nextState.effects[name] && nextState.effects[name][action] && nextState.effects[name][action].error) {
            this.dispatch.error.hide({ name, action }, null);
          }
          try {
            return await origEffect(...props);
          } catch (error) {
            // display error on console
            console.error(error);
            this.dispatch.error.show({ name, action }, error);
          }
        };

        effectWrapper.isEffect = true;

        // replace existing effect with new wrapper
        this.dispatch[name][action] = effectWrapper;
      });
    },
    onStoreCreated(store: any) {
      function useModelEffectsError(name) {
        return store.useSelector(state => state.error.effects[name]);
      };
      function withModelEffectsError(name: string, mapModelEffectsErrorToProps?) {
        mapModelEffectsErrorToProps = (mapModelEffectsErrorToProps || ((errors) => ({ [`${name}EffectsError`]: errors })));
        return (Component) => {
          return (props): React.ReactElement => {
            const value = useModelEffectsError(name);
            const withProps = mapModelEffectsErrorToProps(value);
            return (
              <Component
                {...withProps}
                {...props}
              />
            );
          };
        };
      };
      return { useModelEffectsError, withModelEffectsError };
    },
  };
};
