import { connect as reduxConnect, createSelectorHook, createDispatchHook } from 'react-redux';
import store from './store';

export const useSelector = createSelectorHook(store.context);
export const useDispatch = createDispatchHook(store.context);
export const connect = reduxConnect;
