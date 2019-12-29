import createIcestore from '@ice/store';
import logger from '@ice/store-logger';
import todos from './todos';

const middlewares = [];
if (process.env.NODE_ENV !== 'production') {
  middlewares.push(logger);
}

export default createIcestore({todos}, middlewares);
