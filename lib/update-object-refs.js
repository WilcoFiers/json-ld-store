'use strict';
const TYPE = '@type';
const ID = '@id';

function removeFromArray(item, arr) {
    let i = arr.indexOf(item);
    if (i !== -1) {
        arr.splice(i, 1);
    }
}

function updateObjectRefs(idProps, refMap, idMap, obj) {
    const findPropInMap = (prop, obj) => {
        return typeof refMap[obj[ID]] === 'object' ?
            refMap[obj[ID]][prop] :
            undefined;
    }

    const getKnownBy = (obj) => findPropInMap('knownBy', obj);
    const getKnows = (obj) => findPropInMap('knows', obj);


    var knows = [];

    Object.keys(obj)
    .forEach((prop) => {
        let val = obj[prop];

        val = (Array.isArray(val) ? val : [val])
        .map((val) => {
            if (idProps.indexOf(prop) !== -1 &&
                    typeof val === 'string' && typeof idMap[val] === 'object') {
                if (Array.isArray(obj[prop])) {
                    let i = obj[prop].indexOf(val);
                    obj[prop].splice(i, 1, idMap[val]);

                } else {
                    obj[prop] = idMap[val];
                }
                val = idMap[val];
            }

            return (typeof val === 'object' ? val : null);

        }).filter((val) => val !== null);

        val.forEach((val) => {
            if (getKnownBy(val).indexOf(obj) === -1) {
                getKnownBy(val).push(obj);
            }
            if (knows.indexOf(val) === -1) {
                knows.push(val);
            }
        });
    });

    getKnows(obj).forEach(function (oldRef) {
        if (knows.indexOf(oldRef) === -1) {
            removeFromArray(obj, getKnownBy(oldRef));
        }
    });
    refMap[obj[ID]].knows = knows;
}


module.exports = updateObjectRefs;
