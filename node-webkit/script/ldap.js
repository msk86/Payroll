var Ldap = require('ldapjs');
var ldapOptions = require('../config/ldap.json');

function sync(ids, entryCb, cb) {
    var client = Ldap.createClient({
        url: ldapOptions.url
    });
    client.bind(ldapOptions.dn, ldapOptions.password, function (err) {
        if (err) {
            window.alert("Sync twers failed: "+err);
            return console.log(err);
        }

        var filter = {
            filter: '|' + ids.map(function (id) {
                return '(' + ldapOptions.idField + '=' + id + ')'
            }).join(''),
            scope: 'sub'
        };
        client.search(ldapOptions.treeBase, filter, function (err, res) {
            if (err) {
                window.alert("Sync twers failed: "+err);
                return console.log(err);
            }

            res.on('searchEntry', entryCb);
            res.on('end', function () {
                client.unbind();
                cb();
            });
        });
    });
}

module.exports = {
    sync: sync
};
