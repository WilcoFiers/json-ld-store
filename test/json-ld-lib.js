/* global describe, it */
'use strict';

let assert = require('chai').assert;
let ldStore = require('../lib/json-ld-store');

describe('json-ld store', () => {

    it('had an init method', function () {
        assert.isObject(ldStore);
        assert.isFunction(ldStore.init);
    });

});

