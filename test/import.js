/* global describe, it */
'use strict';

const assert = require('chai').assert;
const storeImport = require('../lib/import');
const createStore = require('../lib/store');

describe('import', function () {
	let refMap, testStore, context, rambo;

	let shouldNotCall = ((e) => { throw e; });

	beforeEach(function () {
		context = {
			'@vocab': 'http://schema.org',
			schema: 'http://schema.org'
		};
		refMap = {};
		testStore = createStore(refMap, context);
		rambo = {
			'@context': context,
			'@type': 'Person',
			'name': 'John Rambo'
		};
	});

	it('takes a store and JSON-LD data as arguments', function () {
		assert.doesNotThrow(() => storeImport(testStore, rambo) );
	});

	it('returns a promise', function () {
		let res = storeImport(testStore, rambo);
		assert.instanceOf(res, Promise);
		assert.isFunction(res.then);
	});

	it('adds nodes to the store', function (done) {
		assert.lengthOf(testStore.getByType('Person'), 0);

		storeImport(testStore, rambo)
		.then((res) => {
			let persons = testStore.getByType('Person');
			assert.lengthOf(persons, 1);
			assert.equal(persons[0].name, 'John Rambo');
			done();
		})
		.catch(shouldNotCall);
	});

	it('converts the object to the context of the store', function (done) {
		rambo['@type'] = 'schema:Person';

		storeImport(testStore, rambo)
		.then((res) => {
			let persons = testStore.getByType('Person');
			assert.lengthOf(persons, 1);
			assert.equal(persons[0].name, 'John Rambo');
			assert.lengthOf(persons[0]['@type'], 1);
			assert.equal(persons[0]['@type'][0], 'Person');

			done();
		})
		.catch(shouldNotCall);
	});
});