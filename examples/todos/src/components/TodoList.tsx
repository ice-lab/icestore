import React, { Component } from 'react';
import store from '../store';

const { withStore } = store;

class TodoList extends Component<any> {
  onRemove = (index) => {
    const [, actions] = this.props.store;
    actions.remove(index);
  }

  onToggle = (index) => {
    const [, actions] = this.props.store;
    actions.toggle(index);
  }

  render() {
    const { title, store } = this.props;
    const [ state, , effectsState ] = store;
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

export default withStore(
  'todos',
  (state) => ({ ...state, subTitle: 'SubTitle' }),
  (actions) => actions,
  (effectsState) => effectsState,
)(TodoList);
