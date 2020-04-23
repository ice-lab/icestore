import React from 'react';
import { connect, useSelector /* useDispatch */ } from './redux';
import store from './store';

const Count = props => {
  const sharks = useSelector(state => state.sharks);
  // const dispatch = useDispatch();
  // const sharks = store.useModelState('sharks');
  const dispatchers = store.useModelDispatchers('sharks');

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ width: 120 }}>
          <h3>Sharks</h3>
          <h1>{sharks}</h1>
          <button type="button" onClick={() => dispatchers.increment(1)}>+1</button>
        </div>
        <div style={{ width: 120 }}>
          <h3>Dolphins</h3>
          <h1>{props.dolphins}</h1>
          <button type="button" onClick={() => props.dolphinsDispatchers.increment(1)}>+1</button>
        </div>
      </div>
      <p>Using react-redux & icestore</p>
    </div>
  );
};

const mapState = state => ({
  dolphins: state.dolphins,
});

// const mapDispatch = dispatch => ({
//   incrementDolphins: () => dispatch.dolphins.increment(1)
// });

const WrapperedCount = connect(
  mapState,
  undefined,
  undefined,
  { context: store.context },
)(Count);

export default store.withModelDispatchers('dolphins')(WrapperedCount);
