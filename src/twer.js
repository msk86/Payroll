fs = require('fs');
ldap = require('./ldap');
twers = {};

console.log('Init Twer database...');
try {
    twers = require('../res/twer.json');
} catch(e) {
    console.log('No Twer database found, creating...');
    save();
}
console.log('Database inited.');

function getTwer(id) {
    return twers[id];
}

function save() {
    fs.writeFileSync(__dirname + '/../res/twer.json', JSON.stringify(twers));
}

function syncAll(cb) {
    sync(['*'], cb, true);
}

function sync(ids, cb, onlyChina) {
    console.log('Start sync twer...');
    ldap.sync(ids, function(entry) {
        if(!onlyChina || /OU=(Xian|Wuhan|Beijing|Shanghai|Chengdu|China)/i.test(entry.object.distinguishedName)) {
            twers["" + entry.object.msSFU30UidNumber] = {
                twId: entry.object.msSFU30UidNumber,
                name: entry.object.name,
                mail: entry.object.mail
            };
        }
    }, function() {
        console.log('Sync twer finished.');
        save();
        cb();
    });
}

function isEmpty() {
    return JSON.stringify(twers) == '{}';
}

function newIds(ids) {
    return ids.filter(function(id) {
        return !getTwer(id);
    });
}

module.exports = {
    syncAll: syncAll,
    sync: sync,
    save: save,
    getTwer: getTwer,
    isEmpty: isEmpty,
    newIds: newIds
};
