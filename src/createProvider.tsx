import React from 'react';
import Executor from './executor';
import Dispatcher from './dispatcher';
import { Models } from './types';

export default function(context: any, dispatcher: Dispatcher, models: Models) {
  return ({ children }: { children: React.ReactNode }) => {
    return (
      <context.Provider value={dispatcher}>
        {Object.keys(models).map(namespace => {
          const hook = models[namespace];
          return (
            <Executor
              key={namespace}
              namespace={namespace}
              hook={hook}
              onUpdate={(val: any) => {
                dispatcher.data[namespace] = val;
                dispatcher.update(namespace);
              }}
            />
          );
        })}
        {children}
      </context.Provider>
    );
  };
}
