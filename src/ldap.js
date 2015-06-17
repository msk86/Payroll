var ldap = require('ldapjs');
var ldapOptions = require('../res/ldap.json');

function sync(ids, entryCb, cb) {
    var client = ldap.createClient({
        url: ldapOptions.url
    });
    client.bind(ldapOptions.dn, ldapOptions.password, function (err) {
        if (err) return console.log(err);

        var filter = {
            filter: '|' + ids.map(function (id) {
                return '(' + ldapOptions.idField + '=' + id + ')'
            }).join(''),
            scope: 'sub'
        };
        client.search(ldapOptions.treeBase, filter, function (err, res) {
            if (err) return console.log(err);

            res.on('searchEntry', entryCb);
            res.on('end', function () {
                client.unbind();
                cb();
            });
        })
    });
}

module.exports = {
    sync: sync
};
