import Icestore from '@ice/store';
import logger from '@ice/store-logger';
import todos from './todos';

const icestore = new Icestore('todos');

const middlewares = [];

if (process.env !== 'production') {
  middlewares.push(logger);
}

icestore.applyMiddleware(middlewares);
icestore.registerStore('todos', todos);

export default icestore;
