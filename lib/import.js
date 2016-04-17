'use strict';

const CONTEXT = '@context';
const jsonld = require('jsonld');

function storeImport(store, data) {
	let context = store.context;

	let resolve, reject;
	let p = new Promise((res, rej) => {
		resolve = res;
		reject = rej;
	});

	jsonld.flatten(data, context, function (err, flatNodes) {
		if (err) {
			reject(err);
		}
		store.add(flatNodes['@graph']);
		resolve(flatNodes);
	});
	return p;
}

module.exports = storeImport;
