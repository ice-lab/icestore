import Icestore from '@ice/store';
import logger from '@ice/store-logger';
import todos from './todos';

const icestore = new Icestore('todos');

icestore.applyMiddleware([logger]);
icestore.registerStore('todos', todos);

export default icestore;
