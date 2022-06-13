import { createModel } from '@ice/store';
import { delay } from '../utils';

export interface Todo {
  text: string;
  completed: boolean;
}

export type TodosState = Todo[];

const model = createModel({
  state: [
    {
      text: 'Init',
      completed: false,
    },
  ],
  reducers: {
    toggle(state: TodosState, index: number) {
      state[index].completed = !state[index].completed;
    },
    add(state: TodosState, todo: Todo) {
      state.push(todo);
    },
    remove(state: TodosState, index: number) {
      state.splice(index, 1);
    },
    set(state: TodosState, nextState: TodosState) {
      return nextState;
    },
  },
  effects: () => ({
    async refresh() {
      await delay(2000); // wait for data to load

      // pass the result to a local reducer
      this.set([
        {
          text: 'react',
          completed: false,
        },
        {
          text: 'vue',
          completed: true,
        },
      ]);
    },
    async asyncRemove(index: number) {
      await delay(1000);
      this.remove(index);
    },
  }),
});

export default model;
