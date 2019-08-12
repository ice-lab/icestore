import Icestore from '@ice/store';
import debug from '@ice/store-debug';
import todos from './todos';

const icestore = new Icestore();

icestore.applyMiddleware(debug);
icestore.registerStore('todos', todos);

export default icestore;
