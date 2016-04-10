'use strict';

var store = require('./store');

function cloneFreeze(obj) {
    if (Array.isArray(obj)) {
        return Object.freeze(obj.map(cloneFreeze));

    } else if (typeof obj === 'object') {
        let copy = {};
        Object.keys(obj).forEach(function (prop) {
            copy[prop] = cloneFreeze(obj[prop]);
        })
        return Object.freeze(copy);
    }
    return obj;
}


module.exports = {
	init(context) {
		return store(new WeakMap(), cloneFreeze(context));
	}
};
