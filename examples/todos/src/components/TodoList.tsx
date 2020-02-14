import React, { Component } from 'react';
import store from '../store';

const { connect } = store;

class TodoList extends Component<any> {
  onRemove = (index) => {
    this.props.actions.remove(index);
  }

  onToggle = (index) => {
    this.props.actions.toggle(index);
  }

  render() {
    const { title, state, effectsState } = this.props;
    const { dataSource, subTitle } = state;
    return (
      <div>
        <h2>{title}</h2>
        <p>
          Using Class Component, SubTitle is {subTitle}
        </p>
        <ul>
          {dataSource.map(({ name, done = false }, index) => (
            <li key={index}>
              <label>
                <input
                  type="checkbox"
                  checked={done}
                  onChange={() => this.onToggle(index)}
                />
                {done ? <s>{name}</s> : <span>{name}</span>}
              </label>
              {
                effectsState.remove.isLoading ?
                  '...deleting...' :
                  <button type="submit" onClick={() => this.onRemove(index)}>-</button>
              }
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default connect(
  'todos',
  (state) => ({ ...state, subTitle: 'SubTitle' }),
  (actions) => actions,
  (effectsState) => effectsState,
)(TodoList);
