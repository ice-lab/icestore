import { Component } from 'react';
import { transformModel, transformModelActionsStates } from '@ice/store';
import store from '../store';
import { TodoList } from './TodoList';
import todos from '../models/todos';

const { withModel, withModelActionsState } = store;

const todoModel = transformModel(todos);
const todoModelActionsState = transformModelActionsStates(todos);

interface Props {
  title: string;
  todos: typeof todoModel;
  todosActionsState: typeof todoModelActionsState;
}

class TodoListClass extends Component<Props> {
  onRemove = (index) => {
    const [, actions] = this.props.todos;
    actions.remove(index);
  }

  onToggle = (index) => {
    const [, actions] = this.props.todos;
    actions.toggle(index);
  }

  render() {
    const { title, todos, todosActionsState } = this.props;
    const [ state ] = todos;
    const { dataSource } = state;
    return TodoList({
      state: { title, dataSource, subTitle: 'Class Component' },
      actions: { toggle: this.onToggle, remove: this.onRemove },
      actionsState: todosActionsState,
    });
  }
}

export default withModelActionsState('todos')(
  withModel('todos')(TodoListClass),
);
