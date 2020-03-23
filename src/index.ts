import Dispatcher from './dispatcher';
import createContext from './createContext';
import createProvider from './createProvider';
import createUseModel from './createUseModel';
import createGetModel from './createGetModel';
import { Models } from './types';

export const createStore = function(models: Models) {
  const { context, useContext } = createContext();
  const dispatcher = new Dispatcher();
  type IModels = typeof models;

  return {
    Provider: createProvider(context, dispatcher, models),
    useModel: createUseModel<IModels>(useContext),
    getModel: createGetModel(dispatcher),
  };
};


export default createStore;
