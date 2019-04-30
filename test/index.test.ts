import { expect } from 'chai';
import Icestore from '../src/index';
import Store from '../src/store';

describe('#Icestore', function () {
    it('Should new Class be ok.', () => {
        expect(new Icestore()).to.exist;
    });

    describe('#registerStore', function () {
        const icestore = new Icestore();

        it('Should return a Store.', function () {
            const store = icestore.registerStore('test', {
                name: 'ice'
            });
            expect(store instanceof Store).to.be.true;
        });

        it('Should throw an Error when the same namespace is registered.', function() {
            expect(() => icestore.registerStore('test', {})).to.throw(Error, 'Namespace have been used: test');
        })
    });


    describe('#useStore', function () {
        const icestore = new Icestore();

        it('Should throw an Error when the namespace is not exist.', function() {
            expect(() => icestore.useStore('test')).to.throw(Error, 'Not found namespace: test');
        })
    });
});