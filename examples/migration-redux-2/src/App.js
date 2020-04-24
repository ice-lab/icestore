import React from 'react';
import { connect } from 'react-redux';
import { incrementDolphins } from './reducers/dolphins';

const Count = props => (
  <div>
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <div style={{ width: 120 }}>
        <h3>Sharks</h3>
        <h1>{props.sharks}</h1>
        <button type='button' onClick={props.incrementSharks}>+1</button>
      </div>
      <div style={{ width: 120 }}>
        <h3>Dolphins</h3>
        <h1>{props.dolphins}</h1>
        <button type='button' onClick={props.incrementDolphins}>+1</button>
      </div>
    </div>
    <p>Mixing Redux & icestore</p>
  </div>
);

const mapState = state => ({
  sharks: state.sharks,
  dolphins: state.dolphins,
});

const mapDispatch = dispatch => ({
  incrementSharks: () => dispatch.sharks.increment(1),
  incrementDolphins: () => dispatch(incrementDolphins(1)),
});

export default connect(
  mapState,
  mapDispatch,
)(Count);
