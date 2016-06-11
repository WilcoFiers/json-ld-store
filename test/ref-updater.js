/* global describe, it */
'use strict';

const assert = require('chai').assert;
const TYPE = '@type';
const ID = '@id';

const refUpdater = require('../lib/ref-updater');

describe('refUpdater', () => {
	const typeIsId = {'@type': '@id'};

	// set up a ldStore
	beforeEach(function () {
	});

	it('takes an idProps and refMap argument, returning a function', function () {
		const res = refUpdater([], {});
		assert.isFunction (res);
	});

	describe('updateObjectRef()', function () {
		let updateObjectRef, idProps, refMap;

		function addToRefMap(obj) {
			refMap[obj[ID]] = { knownBy: [], knows: [], self: obj };
		}

		beforeEach(function () {
			idProps = [];
			refMap = {};
			updateObjectRef = refUpdater(idProps, refMap);
		});

		it('calls .updateProperty() with each property', function () {
			let id = 'test'
			let props = [ID, 'foo', 'bar', 'baz'];
			let obj = {[ID]: id, foo: 1, bar: 2, baz: 3};
			addToRefMap(obj);

			updateObjectRef.updateProperty = function (updateObject, prop) {
				assert.include(props, prop);
				assert.equal(obj, updateObject);
				// remove each property that is found
				props.splice(props.indexOf(prop), 1);
			};

			assert.lengthOf(props, 4);
			updateObjectRef(obj);

			assert.lengthOf(props, 0);
		});

	});

	describe('updateProperty', function () {

	});

});