/* global describe, it */
'use strict';

let assert = require('chai').assert;
let createStore = require('../lib/store');
const TYPE = '@type';
const ID = '@id';


describe('jsonLdStore', () => {
	let testStore, map, context;

	// set up a ldStore
	beforeEach(function () {
		context = {
			sch: 'http://schema.org',
			Person: { '@id': 'sch:Person' }
		};
		map = new WeakMap();
		testStore = createStore(map, context);
	});

	it('takes a WeakMap and context object as params', function () {
		let myStore = createStore(map, context);
		assert.equal(myStore.context, context);
	});

	describe('store.add(obj)', function () {
		it('adds an object to the map', function () {
			let obj = {
				[TYPE]: 'Person',
				name: 'Bob Dylan'
			};
			testStore.add(obj);
			assert(map.has(obj), 'Object should be added to the map');
		});

		it('throws when there is no `@type` property', function () {
			assert.throws(function () {
				let obj = {
					name: 'Bob Dylan'
				};
				testStore.add(obj);
			});
		});

		it('makes @id and @type immutable', function () {
			let obj = {
				[TYPE]: 'Person',
				[ID]: '_:someId',
				name: 'Bob Dylan'
			};
			testStore.add(obj);
			assert.throw(() => {
				obj[TYPE] = 'Something else';
			});
			assert.throw(() => {
				obj[ID] = 'Something else'
			});
		});

		it('adds an @id property if there is none');

	});

	describe('store.get(id)', function () {
		it('returns an added object with the given id', function () {
			var idVal = '_:someId';
			let obj = {
				[TYPE]: 'Person',
				[ID]: idVal,
				name: 'Bob Dylan'
			};
			testStore.add(obj);
			assert.equal(testStore.get(idVal), obj);
		});

		it('returns undefined if the id is unknown', function () {
			assert.equal(testStore.get('some random id'), undefined);
		});
	});

	describe('store.remove(obj)');
});
