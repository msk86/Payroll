var fs = require('fs');

var twers = {};

try {
    twers = require('../res/twer.json');
} catch (e) {
    save();
}

function save() {
    fs.writeFileSync(__dirname + '../res/twer.json', JSON.stringify(twers));
}

function isEmpty() {
    return JSON.stringify(twers) == '{}';
}

//currently sync function seems can not work because of the ldap connection
function syncAll(cb) {
    sync(['*'], cb, true);
}

function sync(ids, cb, onlyChina) {
}

function findById(id) {
    return twers[id];
}

function all() {
    if (isEmpty()) {
        syncAll(function () {
            window.alert("Sync twers successfully!")
        })
    }

    return twers;
}

module.exports = {
    findById: findById,
    all: all
};
