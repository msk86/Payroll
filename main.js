var ProgressBar = require('progress');

Twer = require('./src/twer');
Excel = require('./src/excel');
Email = require('./src/email');

var twerIds = [];

Excel.open();
Excel.eachRow(function(row) {
    if(row['Employee ID']) {
        twerIds.push(row['Employee ID']);
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
    console.log('Start to send email for', Excel.rowCount(), 'rows.');

    var bar = new ProgressBar('  Sending email [:bar] :percent', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: Excel.rowCount()
    });
    var processed = 0;
    function progress(bar) {
        processed += 1;
        bar.tick(1);
    }

    Excel.eachRow(function(row, i) {
        var twerID = (row['Employee ID'] || '').trim();
        var twer = Twer.getTwer(twerID);

        if(twer) {
            Email.send(twer, row, Excel.titles(), function() {
                progress(bar);

                if(processed >= Excel.rowCount()) {
                    if(didntSend.length) console.log('Payroll at rows', didntSend, 'cannot be sent.');
                }
            });
        } else {
            didntSend.push(i);
            progress(bar);
        }
    });
}
