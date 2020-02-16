import React, { Component } from 'react';
import store from '../store';
import { TodoList } from './TodoList';

const { withModel } = store;

class TodoListClass extends Component<any> {
  onRemove = (index) => {
    const [, actions] = this.props.model;
    actions.remove(index);
  }

  onToggle = (index) => {
    const [, actions] = this.props.model;
    actions.toggle(index);
  }

  render() {
    const { title, model } = this.props;
    const [ state, , actionsState ] = model;
    const { dataSource, subTitle } = state;
    return TodoList(
      { title, subTitle, dataSource },
      { toggle: this.onToggle, remove: this.onRemove },
      actionsState,
    );
  }
}

export default withModel(
  'todos',
  (state) => ({ ...state, subTitle: 'Class Component' }),
  (actions) => actions,
  (actionsState) => actionsState,
)(TodoListClass);
