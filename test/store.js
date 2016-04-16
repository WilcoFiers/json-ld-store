/* global describe, it */
'use strict';

let assert = require('chai').assert;
let createStore = require('../lib/store');
const TYPE = '@type';
const ID = '@id';


describe('jsonLdStore', () => {
	let testStore, refMap, context;

	// set up a ldStore
	beforeEach(function () {
		context = {
			'@vocab': 'http://schema.org',
			sch: 'http://schema.org'
		};
		refMap = {};
		testStore = createStore(refMap, context);
	});

	it('takes a refMap object and context object as params', function () {
		let myStore = createStore(refMap, context);
		assert.equal(myStore.context, context);
	});

	describe('store.add(obj)', function () {
		it('adds an object to the map', function () {
			let obj = {
				[TYPE]: 'Person',
				name: 'Bob Dylan'
			};
			testStore.add(obj);
			assert.isObject(refMap[ obj[ID] ]);
			assert.isArray(refMap[ obj[ID] ].knows);
			assert.isArray(refMap[ obj[ID] ].knownBy);
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

		it('adds an @id property if there is none', function () {
			let obj = {
				[TYPE]: 'Person',
				name: 'Bob Dole'
			};
			testStore.add(obj);
			assert.isString(obj[ID]);
			assert.equal(obj[ID].substr(0,2), '_:');
		});

		it('creates a bi-directional reference to it\'s properties', function () {
			refMap
			let dylan = {
				[TYPE]: 'Person',
				[ID]: '_:dylan',
				name: 'Bob Dylan'
			};
			let builder = {
				[TYPE]: 'Person',
				[ID]: '_:builder',
				name: 'Bob Builder',
				knows: dylan
			};

			testStore.add(dylan);
			testStore.add(builder);

			assert.include(refMap['_:dylan'].knownBy, builder);
			assert.include(refMap['_:builder'].knows, dylan);
		});
	});

	describe('store.getById(id)', function () {
		it('returns an added object with the given id', function () {
			var idVal = '_:someId';
			let obj = {
				[TYPE]: 'Person',
				[ID]: idVal,
				name: 'Bob Dylan'
			};
			testStore.add(obj);
			assert.equal(testStore.getById(idVal), obj);
		});

		it('returns undefined if the id is unknown', function () {
			assert.equal(testStore.getById('some random id'), undefined);
		});
	});

	describe('store.getByType()', function () {
		beforeEach(function () {
			testStore.add({
				[TYPE]: ['Person', 'Singer'],
				name: 'Johnny Cash'
			});
			testStore.add({
				[TYPE]: ['Person'],
				name: 'Johnny Depp'
			});
		});

		it('returns an array of objects of a given @type', function () {
			var result = testStore.getByType('Person');
			assert.isArray(result);
			assert.lengthOf(result, 2);
			assert.equal(result[0].name, 'Johnny Cash')
			assert.equal(result[1].name, 'Johnny Depp');
		});

		it('does not return an internal array', function () {
			var result = testStore.getByType('Person');
			assert.lengthOf(result, 2);
			result.pop();
			assert.lengthOf(result, 1);

			result = testStore.getByType('Person');
			assert.lengthOf(result, 2);
		});
	});

	describe('store.remove(obj)', function () {
		let walker, astin;
		beforeEach(function () {
			walker = {
				[ID]: '_:walker',
				[TYPE]: 'Brand',
				name: 'Johnny Walker'
			};
			astin = {
				[ID]: '_:addams',
				[TYPE]: 'Person',
				name: 'Johnny Astin',
				drinks: walker,
				likes: [walker, 'Grolsch']
			};
			testStore.add(walker);
			testStore.add(astin)
		});

		it('makes the object unfindable', function () {
			assert.isObject(testStore.getById('_:walker'));

			testStore.remove(walker)
			assert.isUndefined(testStore.getById('_:walker'));
			assert.lengthOf(testStore.getByType('Brand'), 0);
		});

		it('removes references in other objects', function () {
			assert.equal(astin.drinks, walker);

			testStore.remove(walker);
			assert.isNull(astin.drinks);
		});

		it('removes references from known arrays', function () {
			assert.equal(astin.likes[0], walker);

			assert.lengthOf(astin.likes, 2);
			assert.equal(astin.likes[0], walker);
			testStore.remove(walker);
			assert.lengthOf(astin.likes, 1);
			assert.notEqual(astin.likes[0], walker);
		});
	});
});
