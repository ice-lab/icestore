import * as React from 'react';
import { render, fireEvent, getByTestId} from 'react-testing-library';
import Icestore from '../src/index';
import Store from '../src/store';

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

describe('#Icestore', function () {
    test('new Class should be defined.', () => {
        expect(new Icestore()).toBeDefined();
    });

    describe('#registerStore', function () {
        let icestore;

        beforeEach(() => {
            icestore = new Icestore();
        });

        test('should return a Store.', function () {
            const store = icestore.registerStore('test', {
                name: 'ice'
            });
            expect(store instanceof Store).toBe(true);
        });

        test('should throw an Error when the same namespace is registered.', function() {
            icestore.registerStore('test', {});
            expect(() => icestore.registerStore('test', {})).toThrowError('Namespace have been used: test');
        });
    });

    describe('#useStore', function () {
        let icestore;

        beforeEach(() => {
            icestore = new Icestore();
        });

        afterEach(() => {
            icestore = null;
        });
  
        test('should throw an Error when the namespace is not exist.', function() {
            expect(() => icestore.useStore('test')).toThrowError('Not found namespace: test');
        });

        test('should useStore be ok.', async function() {
            const initState = {
                name: 'ice'
            };
            const newState = {
                name: 'rax'
            };
            icestore.registerStore('todo', {
                dataSource: initState,
                setData: function(dataSource) {
                    this.dataSource = dataSource;
                }
            });

            const renderFn = jest.fn();

            const Todos = () => {
                const todo: any = icestore.useStore('todo');
                const { dataSource } = todo;

                renderFn();

                function handleClick() {
                    todo.setData(newState);
                }

                return <div>
                    <span data-testid="nameValue">{dataSource.name}</span>
                    <button data-testid="actionButton" onClick={handleClick}>
                        Click me
                    </button>
                </div>;
            };
           
            const { container } = render(<Todos />);
            const nameValue = getByTestId(container, 'nameValue');
            const actionButton = getByTestId(container, 'actionButton');

            expect(nameValue.textContent).toEqual(initState.name);
            expect(renderFn).toHaveBeenCalledTimes(1);

            fireEvent.click(actionButton);

            await sleep(10);

            expect(renderFn).toHaveBeenCalledTimes(2);
            expect(nameValue.textContent).toEqual(newState.name);
        });

        test('should useStores be ok.', function() {
            const todo = { name: 'ice' };
            const project = { name: 'rax' };
            icestore.registerStore('todo', todo);
            icestore.registerStore('project', project);

            const App = () => {
                const [todo, project] = icestore.useStores(['todo', 'project']);

                return <div>
                    <span data-testid="todoName">{todo.name}</span>
                    <span data-testid="projectName">{project.name}</span>
                </div>;
            };
           
            const { container } = render(<App />);
            const todoName = getByTestId(container, 'todoName');
            const projectName = getByTestId(container, 'projectName');

            expect(todoName.textContent).toEqual(todo.name);
            expect(projectName.textContent).toEqual(project.name);
        });
    });
});