'use strict';
const TYPE = '@type';
const ID = '@id';

function makeImmutable(obj, prop) {
    Object.defineProperty(obj, prop, {
        enumerable: true,
        configurable: false,
        writable: false,
        value: obj[prop]
    });
}

function getTypes(obj) {
    if (obj[TYPE]) {
        return Array.isArray(obj.type) ? obj.type : [obj.type];
    } else if (obj['@type']) {
        return Array.isArray(obj['@type']) ? ob['@type'] : [obj['@type']];
    } else {
        return [];
    }
}

function testObject(obj) {
    if (typeof obj !== 'object') {
        throw TypeError('Expected type === `object`');
    }
}

function ldStore (map, context) {
    let idMap = {};

    var store = {
        context: context,
        /**
         * Add an object to the linked data store
         * @param {object} obj  JSON-LD Object
         */
        add(obj) {
            testObject(obj);
            if (!obj[TYPE]) {
                throw new TypeError('Invalid JSON-LD @type')
            }
            makeImmutable(obj, TYPE);
            makeImmutable(obj, ID);

            if (obj[ID]) {
                idMap[obj[ID]] = obj;
            }

            map.set(obj, []);
        },
        get(id) {
            return idMap[id];
        },
        remove(obj) {

        },
        import: require('./import').bind(store, map)
    };
    return store;
}

module.exports = ldStore;

// add(obj) {
//     if (Array.isArray(obj)) {
//         obj.forEach(model.add);
//         obj.forEach(model.updateRefs);
//         return model;
//     }
//     // remember the object's id
//     idMap[obj.id] = obj;

//     // Register object with it's types
//     var types = getTypes(obj);
//     types.forEach(function (type) {
//         if (!data[type]) {
//             // Create a new type and a getter for it
//             data[type] = [];
//             model['get' + type + 's'] = getter(type);
//         }
//         // new object
//         if (data[type].indexOf(obj) === -1) {
//             data[type].push(obj);
//         }
//     });

//     // Build the object's connections
//     model.updateRefs(obj);

//     types.push('*')
//     types.forEach(function (type) {
//         if (triggers.add[type]) {
//             triggers.add[type].forEach(function (cb) {
//                 cb(obj, type, modal);
//             }
//         }
//     });

//     return model;
// },

// forget(obj) {
//     if (Array.isArray(obj)) {
//         obj.forEach(model.remove);
//         return model;
//     }
//     var types = getTypes(obj);
//     types.forEach(function (type) {
//         data[type].splice(data[type].indexOf(obj), 1);
//     });

//     types.push('*')
//     types.forEach(function (type) {
//         if (triggers.forget[type]) {
//             triggers.forget[type].forEach(function (cb) {
//                 cb(obj, type, modal);
//             }
//         }
//     });
//     delete idMap[obj.id];
//     return model;
// }


// updateRefs(obj) {
//     if (!idMap[obj.id]) {
//         throw new Error('Unknown object with id ' + obj.id);
//     }
//     for (let key of obj) {
//         if (key === 'id' || key === '@id') {
//             return;
//         }
//         if (typeof obj[key] === 'object' && obj[key].id && idMap[obj[key].id]) {
//             obj[key] = idMap[obj[key].id];

//         } else if (Array.isArray(obj[key])) {
//             obj[key] = obj[key].map(function (prop) {
//                 if (typeof prop === 'object' &&
//                     prop.id && idMap[prop.id]) {
//                     return idMap[prop.id];
//                 } else {
//                     return prop;
//                 }
//             });
//         } else if (typeof obj[key] === 'string' && obj[key].substr(0,2) === '_:' && idMap[obj[key]]) {
//             obj[key] = idMap[obj[key]];
//         }
//     }
// },
