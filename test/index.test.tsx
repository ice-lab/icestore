import { expect } from 'chai';
import { mount } from 'enzyme';
import Icestore from '../src/index';
import Store from '../src/store';

describe('#Icestore', function () {
    it('should new Class be ok.', () => {
        expect(new Icestore()).to.exist;
    });

    describe('#registerStore', function () {
        const icestore = new Icestore();

        it('should return a Store.', function () {
            const store = icestore.registerStore('test', {
                name: 'ice'
            });
            expect(store instanceof Store).to.be.true;
        });

        it('should throw an Error when the same namespace is registered.', function() {
            expect(() => icestore.registerStore('test', {})).to.throw(Error, 'Namespace have been used: test');
        });
    });

    describe('#useStore', function () {
        const icestore = new Icestore();

        it('should throw an Error when the namespace is not exist.', function() {
            expect(() => icestore.useStore('test')).to.throw(Error, 'Not found namespace: test');
        });

        it('should useStore be ok.', function() {
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

                expect(dataSource).to.deep.equal(initState);

                return <div />;
              };
              
              mount(
                <Todos />
              );
        });
    });
});