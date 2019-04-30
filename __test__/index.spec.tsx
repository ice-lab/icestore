import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
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
        const icestore = new Icestore();

        test('should throw an Error when the namespace is not exist.', function() {
            expect(() => icestore.useStore('test')).toThrowError('Not found namespace: test');
        });

        test('should useStore be ok.', function() {
            const initState = [
                {
                    name: 'ice'
                }
            ];
            icestore.registerStore('todos', {
                dataSource: initState,
            });

            const Todos = () => {
                const todos: any = icestore.useStore('todos');
                const { dataSource } = todos;

                expect(dataSource).toEqual(initState);

                return <div />;
            };
              
            TestRenderer.create(
                <Todos />
            );
        });
    });
});