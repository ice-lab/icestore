import { delay } from '../utils';

export interface Todo {
  text: string;
  completed?: boolean;
}

export type TodosState = Todo[];

const model = {
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
    setState(state: TodosState, payload: TodosState) {
      return payload;
    },
  },
  effects: () => ({
    async refresh() {
      await delay(2000); // wait for data to load

      // pass the result to a local reducer
      this.setState([
        {
          text: 'react',
        },
        {
          text: 'vue',
          completed: true,
        },
      ]);
    },
    async removeAsync(index: number) {
      await delay(1000);
      this.remove(index);
    },
  }),
};

export default model;
