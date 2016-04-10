/* global describe, it */
'use strict';

let assert = require('chai').assert;
let ldStore = require('../lib/json-ld-store');

describe('jsonLdStore init', () => {

    it('has an init method', () => {
        assert.isObject(ldStore);
        assert.isFunction(ldStore.init);
    });

    it('returns a store', () => {
    	let myStore = ldStore.init({});
    	assert.isFunction(myStore.get);
    	assert.isFunction(myStore.add);
    	assert.isFunction(myStore.remove);
    	assert.isFunction(myStore.import);
    });

    it('has a frozen copy of the context', function () {
        let context = { foo: { bar: 'baz'} };
        let myStore = ldStore.init(context);


        assert.isFrozen(myStore.context);
        assert.isFrozen(myStore.context.foo);
        assert.deepEqual(myStore.context, context);
    });

});

