import * as React from 'react';
import * as ReactDOM from 'react-dom';
import{ act } from 'react-dom/test-utils';
import Icestore from '../src/index';
import Store from '../src/store';

describe('#Icestore', function () {
    test('new Class should be defined.', () => {
        expect(new Icestore()).toBeDefined();
    });

    describe('#registerStore', function () {
        const icestore = new Icestore();

        test('should return a Store.', function () {
            const store = icestore.registerStore('test', {
                name: 'ice'
            });
            expect(store instanceof Store).toBe(true);
        });

        test('should throw an Error when the same namespace is registered.', function() {
            expect(() => icestore.registerStore('test', {})).toThrowError('Namespace have been used: test');
        });
    });

    describe('#useStore', function () {
        let container;

        beforeEach(() => {
            container = document.createElement('div');
            document.body.appendChild(container);
        });

        afterEach(() => {
            document.body.removeChild(container);
            container = null;
        });

        const icestore = new Icestore();
        const initState = [
            {
                name: 'ice'
            }
        ];
        icestore.registerStore('todos', {
            dataSource: initState
        });

        test('should throw an Error when the namespace is not exist.', function() {
            expect(() => icestore.useStore('test')).toThrowError('Not found namespace: test');
        });

        test('should useStore be ok.', function() {
            let data;
            const Todos = () => {
                const todos: any = icestore.useStore('todos');
                data = todos.dataSource;

                return <div />;
            };
              
            act(() => {
                ReactDOM.render(<Todos />, container);
            });

            expect(data).toEqual(initState);
        });
    });
});