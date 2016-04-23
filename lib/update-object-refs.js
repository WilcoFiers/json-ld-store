'use strict';
const TYPE = '@type';
const ID = '@id';

function removeFromArray(item, arr) {
    let i = arr.indexOf(item);
    if (i !== -1) {
        arr.splice(i, 1);
    }
}

const findPropInMap = (prop, obj, refMap) => {
    return typeof refMap[obj[ID]] === 'object' ?
        refMap[obj[ID]][prop] :
        undefined;
}

function updateProperty(idProps, refMap, obj, prop) {
    let val = obj[prop];

    return (Array.isArray(val) ? val : [val])
    .map((val) => {
        // Find each ID that's already in the refMap
        if (idProps.indexOf(prop) !== -1 &&
                typeof val === 'string' && typeof refMap[val] === 'object') {

            // If the current property is an array, replace
            if (Array.isArray(obj[prop])) {
                let i = obj[prop].indexOf(val);
                obj[prop].splice(i, 1, refMap[val].self);

            // otherwise, swap
            } else {
                obj[prop] = refMap[val].self;
            }
            val = refMap[val].self;
        }

        return (typeof val === 'object' ? val : null);

    }).filter((val) => val !== null);
}


function updateObjectRefs(idProps, refMap, obj) {
    const getKnownBy = (obj) => findPropInMap('knownBy', obj, refMap);
    const getKnows = (obj) => findPropInMap('knows', obj, refMap);

    // Get a list of current known objects
    // to compare to a list of previously known
    var currKnown = [];

    Object.keys(obj).map((prop) => {
        // Make sure all ID references of known objects are replaced by
        // the actual object
        return updateProperty(idProps, refMap, obj, prop);

    // Go through each reffed object
    }).forEach((knownObjects) => knownObjects.forEach((reffedObject) => {
        // if it doesn't know the current object, add it
        if (getKnownBy(reffedObject).indexOf(obj) === -1) {
            getKnownBy(reffedObject).push(obj);
        }
        // if the current object isn't known yet, add it
        if (currKnown.indexOf(reffedObject) === -1) {
            currKnown.push(reffedObject);
        }
    }));

    // Find all objects are no longer known, and remove their ref
    getKnows(obj).forEach(function (oldRef) {
        if (currKnown.indexOf(oldRef) === -1) {
            removeFromArray(obj, getKnownBy(oldRef));
        }
    });

    // Now replace the old list of known refs with the new one
    refMap[obj[ID]].knows = currKnown;
}


module.exports = updateObjectRefs;
