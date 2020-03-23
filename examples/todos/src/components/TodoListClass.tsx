import { Component } from 'react';
// import { Assign } from 'utility-types';
// import { UseModelValue, ModelEffectsState } from '@ice/store';
// import compose from 'lodash/fp/compose';
// import store from '../store';
// import { TodoList as TodoListFn } from './TodoList';
// import todosModel from '../models/todos';

// const { withModel, withModelEffectsState } = store;

// interface MapModelToProp {
//   todos: UseModelValue<typeof todosModel>;
// }

// interface MapModelEffectsStateToProp {
//   todosActionsState: ModelEffectsState<typeof todosModel>;
// }

// interface CustomProp {
//   title: string;
// }

// type PropsWithModel = Assign<MapModelToProp, MapModelEffectsStateToProp>;
// type Props = Assign<CustomProp, PropsWithModel>;

// class TodoList extends Component<Props> {
//   onRemove = (index) => {
//     const [, actions] = this.props.todos;
//     actions.remove(index);
//   }

//   onToggle = (index) => {
//     const [, actions] = this.props.todos;
//     actions.toggle(index);
//   }

//   render() {
//     const { title, todos, todosActionsState } = this.props;
//     const [ state ] = todos;
//     const { dataSource } = state;
//     return TodoListFn({
//       state: { title, dataSource, subTitle: 'Class Component' },
//       actions: { toggle: this.onToggle, remove: this.onRemove },
//       effectsState: todosActionsState,
//     });
//   }
// }

// export default withModelEffectsState('todos')<PropsWithModel, Props>(
//   withModel('todos')(TodoList),
// );

// functional flavor:
// export default compose(withModelEffectsState('todos'), withModel('todos'))(TodoList);
