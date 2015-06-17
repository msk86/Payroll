var ldap = require('ldapjs');
var ldapOptions = require('../res/ldap.json');

function sync(ids, entryCb, cb) {
    var client = ldap.createClient({
        "url": "ldap://chidc04.corporate.thoughtworks.com:389"
    });
    client.bind(ldapOptions.dn, ldapOptions.password, function(err) {
        if(err) return console.log(err);

        var treeBase = "ou=Employees,ou=Enterprise,ou=Principal,dc=corporate,dc=thoughtworks,dc=com";
        var filter = {
            filter: '|' + ids.map(function(id) {return '(msSFU30UidNumber=' + id + ')'}).join(''),
            scope: 'sub'
        };
        client.search(treeBase, filter, function(err, res) {
            if(err) return console.log(err);

            res.on('searchEntry', entryCb);
            res.on('end', function() {
                client.unbind();
                cb();
            });
        })
    });
}

module.exports = {
    sync: sync
};
