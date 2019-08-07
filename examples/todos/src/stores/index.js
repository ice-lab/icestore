import todos from './todos';
import Icestore from '@ice/store';
import debug from '@ice/store-debug';

const icestore = new Icestore();

icestore.applyMiddleware(debug);
icestore.registerStore('todos', todos);

export default icestore;
