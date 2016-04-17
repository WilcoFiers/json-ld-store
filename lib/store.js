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


    let idMap = {};
    let typeMap = {};
    const uuid = require('uuid');

    // Make a list of all properties that can be IDs
    const idProps = Object.keys(context)
    .filter((key) => typeof context[key] === 'object' && context[key][TYPE] === ID);

    const addToRefs = require('./update-object-refs')
    .bind(null, idProps, refMap, idMap);

    const findPropInMap = (prop, obj) => {
        return typeof refMap[obj[ID]] === 'object' ?
            refMap[obj[ID]][prop] :
            undefined;
    }

    const getKnownBy = (obj) => findPropInMap('knownBy', obj);
    const getKnows = (obj) => findPropInMap('knows', obj);


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


    var store = {
        context: context,
        /**
         * Add an object to the linked data store
         * @param {object} obj  JSON-LD Object
         */
        add(newObjects) {
            if (arguments.length > 1) {
                newObjects = Array.prototype.slice.call(arguments);
            } else if (!Array.isArray(newObjects)) {
                newObjects = [newObjects];
            }

            newObjects.forEach((obj) => {
                // fit the object to the store
                normalize(obj);

                // Create references
                idMap[obj[ID]] = obj;
                obj[TYPE].forEach((type) => {
                    if (!typeMap[type]) {
                        typeMap[type] = [];
                    }
                    typeMap[type].push(obj);
                });
                refMap[ obj[ID] ] = { knownBy: [], knows: [] };
            });
            // add all references
            newObjects.forEach((obj) => addToRefs(obj) )
        },

        getById(id) {
            return idMap[id];
        },
        getByType(type) {
            return (typeMap[type] || []).slice();
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

        update(obj) {
            addToRefs(obj);
        },

        import: require('./import').bind(null, store)
    };
    return store;
}

module.exports = ldStore;
