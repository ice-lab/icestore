
import * as isFunction from 'lodash.isfunction';
import { useState, useEffect } from 'react';

export default class Store {
    private state: {[name: string]: any} = {};

    private methods = {};

    private queue = [];


    public constructor(bindings: object) {
        for (const key in bindings) {
            const value = bindings[key];

            if (isFunction(value)) {
                this.methods[key] = this.createMethod(value);
            } else {
                this.state[key] = value;
            }
        }
    } 

    private createMethod(fun) {
        return async (...args) => {
            const newState = {...this.state};
            await fun.apply(newState, args);
            this.setState(newState);
        };
    }

    private setState(newState) {
        this.state = newState;
        const queue = [].concat(this.queue);
        this.queue = [];
        queue.forEach(setState => setState(newState));
    }

    public useStore() { 
        const [, setState] = useState();
        useEffect(() => {
            const index = this.queue.length;
            this.queue.push(setState);
            return () => {
                this.queue.splice(index, 1);
            };
        });

        return { ...this.state, ...this.methods };
    }
}