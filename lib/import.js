'use strict';

// var ldModelFactory = function (source) {
// 	source = source || {};
// 	var data = {};
// 	var idMap = {};
// 	var context = source['@context'];
// 	var triggers = {
// 		add: {'*': []},
// 		forget: {'*': []}
// 	};

// 	var getter = function (type) {
// 		return function (filter) {
// 			if (typeof filter === 'undefined') {
// 				return [].concat(data[type]);

// 			} else if (typeof filter === 'function') {
// 				return data.filter(filter);
// 			}
// 		}
// 	};


// 	if (source['@graph']) {
// 		model.add(source['@graph']);
// 	}
// 	return model;
// }


function storeImport(context, callback) {
	let resolve, reject;
	let p = new Promise((res, rej) => {
		resolve = res;
		reject = rej;
	});

	return p;
	// callback = callback || function () {};
	// jsonld.flatten(data, context, function (err, res) {
	// 	if (err) {
	// 		callback(err);
	// 	}
	// 	var ldModel = ldModelFactory(res);
	// 	callback(null, ldModel);
	// });
}

module.exports = storeImport;