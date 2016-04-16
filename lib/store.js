'use strict';

function makeImmutable(obj, prop) {
    Object.defineProperty(obj, prop, {
        enumerable: true,
        configurable: false,
        writable: false,
        value: obj[prop]
    });
}

function removeFromArray(item, arr) {
    let i = arr.indexOf(item);
    if (i !== -1) {
        arr.splice(i, 1);
    }
}

function testObject(obj) {
    if (typeof obj !== 'object') {
        throw TypeError('Expected type === `object`');
    }
}


function ldStore (refMap, context) {

    const TYPE = '@type';
    const ID = '@id';
    const uuid = require('uuid');

    function getKnownBy(obj) {
        let ref = refMap[obj[ID]];
        return typeof ref === 'object' ? ref.knownBy : undefined;
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


    function normalize(obj) {
        testObject(obj);
        if (!obj[TYPE]) {
            throw new TypeError('Invalid JSON-LD @type')
        }
        if (typeof obj[TYPE] === 'string') {
            obj[TYPE] = [obj[TYPE]];
        }

        if (!obj[ID]) {
            obj[ID] = '_:' + uuid.v4();
        }

        makeImmutable(obj, TYPE);
        Object.freeze(obj[TYPE]);
        makeImmutable(obj, ID);
    }

    function addToRefs(obj) {
        if (!refMap[ obj[ID] ]) {
            refMap[ obj[ID] ] = { knownBy: [], knows: [] };
        }

        Object.keys(obj)
        .forEach((prop) => {
            let val = obj[prop];
            if (typeof val !== 'object') {
                return;
            }
            (Array.isArray(val) ? val : [val])
            .forEach((val) => {
                if (typeof val !== 'object' ||  !getKnownBy(val)) {
                    return;
                }
                if (getKnownBy(val).indexOf(obj) === -1) {
                    getKnownBy(val).push(obj);

                    console.log(val[ID], getKnownBy(val));
                }
            });

        });
    }

    function forget(obj, subject) {
        Object.keys(obj)
        .forEach((prop) => {
            let val = obj[prop];
            if (typeof val !== 'object') {
                return;
            }
            if (Array.isArray(val)) {
                removeFromArray(subject, val);
            } else if (val === subject) {
                obj[prop] = null;
            }
        });
    }

    let idMap = {};
    let typeMap = {};

    var store = {
        context: context,
        /**
         * Add an object to the linked data store
         * @param {object} obj  JSON-LD Object
         */
        add(obj) {
            if (Array.isArray(obj)) {
                return store.add.apply(store, obj);
            }
            if (arguments.length > 1) {
                let args = Array.prototype.slice.call(arguments);
                args.shift();
                store.add(args);
            }
            normalize(obj);

            idMap[obj[ID]] = obj;
            obj[TYPE].forEach((type) => {
                if (!typeMap[type]) {
                    typeMap[type] = [];
                }
                typeMap[type].push(obj);
            });

            // Creates a map of all objects
            addToRefs(obj);
        },

        getById(id) {
            return idMap[id];
        },
        getByType(type) {
            return typeMap[type].slice();
        },
        remove(obj) {
            obj[TYPE].forEach((type) => {
                removeFromArray(obj, typeMap[type]);
            });
            delete idMap[ obj[ID] ];
            let refs = getKnownBy(obj);
            refs.forEach((ref) => forget(ref, obj));
            removeFromArray(refMap, obj[ID] );
        },
        import: require('./import').bind(store, refMap)
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
