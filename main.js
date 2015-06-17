Twer = require('./src/twer');
Excel = require('./src/excel');
Email = require('./src/email');


var twerIds = [];

Excel.open();
Excel.eachRow(function(row) {
    if(row.ID) {
        twerIds.push(row.ID);
    }
});
if(Twer.isEmpty()) {
    Twer.syncAll(syncFinish);
} else {
    var needSyncIds = Twer.newIds(twerIds);
    if(needSyncIds.length) {
        Twer.sync(needSyncIds, syncFinish);
    } else {
        syncFinish();
    }
}

function syncFinish() {
    var didntSend = [];
    console.log('Start send email...');
    Excel.eachRow(function(row, i) {
        var twerID = (row['Employee ID'] || '').trim();
        var twer = Twer.getTwer(twerID);

        if(twer) {
            Email.send(twer, row, Excel.titles());
        } else {
            didntSend.push(i);
        }
    });

    console.log('Email sent.');

    if(didntSend.length) console.log('Row number which payroll didn\'t send:', didntSend);
}
