/* global describe, it */
'use strict';

const assert = require('chai').assert;
const createStore = require('../lib/store');
const TYPE = '@type';
const ID = '@id';


describe('jsonLdStore', () => {
	let testStore, refMap, context;
	let typeIsId = {'@type': '@id'};

	// set up a ldStore
	beforeEach(function () {
		context = {
			'@vocab': 'http://schema.org',
			sch: 'http://schema.org',
			likes: typeIsId,
			fanboys: typeIsId
		};
		refMap = {};
		testStore = createStore(refMap, context);
	});

	it('takes a refMap object and context object as params', function () {
		let myStore = createStore(refMap, context);
		assert.equal(myStore.context, context);
	});

	it('understands overriding @id');

	it('understands overriding @type');

	it('understands overriding @graph');

	it('converts reverse relationships');

	it('sets up reverse relationships defined in @context');

	describe('store.add(obj)', function () {
		let dylan, builder;
		beforeEach(function () {
			dylan = {
				[TYPE]: 'Person',
				[ID]: '_:dylan',
				name: 'Bob Dylan'
			};
			builder = {
				[TYPE]: 'Person',
				[ID]: '_:builder',
				name: 'Bob Builder',
				likes: dylan
			};
		});

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
			assert.throws(() => {
				obj[TYPE] = 'Something else';
			});
			assert.throws(() => {
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
			testStore.add(dylan);
			testStore.add(builder);
			assert.isObject(refMap['_:builder']);
			assert.include(refMap['_:dylan'].knownBy, builder);
			assert.include(refMap['_:builder'].knows, dylan);
		});

		it('can take an array of new objects', function () {
			testStore.add([builder, dylan]);
			assert.isObject(refMap['_:builder']);
			assert.include(refMap['_:dylan'].knownBy, builder);
			assert.include(refMap['_:builder'].knows, dylan);
		});

		it('can take multiple arguments', function () {
			testStore.add(builder, dylan);
			assert.isObject(refMap['_:builder']);
			assert.include(refMap['_:dylan'].knownBy, builder);
			assert.include(refMap['_:builder'].knows, dylan);
		});

		it('identifies IDs to other objects and substitutes them', function () {
			builder.likes = [dylan[ID]];
			builder.fanboys = dylan[ID];

			testStore.add(builder, dylan);
			assert.lengthOf(builder.likes, 1);
			assert.equal(builder.likes[0], dylan);
			assert.equal(builder.fanboys, dylan);
		});

		it('replaces ID refs with the actual object once it is added', function () {
			builder.likes = [dylan[ID]];
			builder.fanboys = dylan[ID];

			testStore.add(builder);
			assert.lengthOf(builder.likes, 1);
			assert.equal(builder.likes[0], dylan[ID]);

			testStore.add(dylan);
			assert.equal(builder.likes[0], dylan);
		});

		it('inserts reverse relationships')

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

	describe('store.update(obj)', function () {
		let hurr, button;
		beforeEach(function () {
			hurr = {
				[TYPE]: 'Person',
				[ID]: '_:hurr',
				name: 'Ben Hurr'
			};
			button = {
				[TYPE]: 'Person',
				[ID]: '_:button',
				name: 'Ben Button',
				watched: hurr
			};

			testStore.add(hurr);
			testStore.add(button);
		});

		it('adds new bi-directional relation to the refMap', function () {
			assert.lengthOf(refMap['_:hurr'].knows, 0);
			assert.lengthOf(refMap['_:button'].knownBy, 0);

			hurr.inspired = button;
			testStore.update(hurr);

			assert.lengthOf(refMap['_:hurr'].knows, 1);
			assert.lengthOf(refMap['_:button'].knownBy, 1);
			assert.include(refMap['_:hurr'].knows, button);
			assert.include(refMap['_:button'].knownBy, hurr);
		});

		it('removes outdated references', function () {
			assert.lengthOf(refMap['_:button'].knows, 1);
			assert.lengthOf(refMap['_:hurr'].knownBy, 1);
			assert.include(refMap['_:button'].knows, hurr);
			assert.include(refMap['_:hurr'].knownBy, button);
			assert.equal(button.watched, hurr);

			delete button.watched;
			testStore.update(button);

			assert.lengthOf(refMap['_:button'].knows, 0);
			assert.lengthOf(refMap['_:hurr'].knownBy, 0);
		});
	});

});
