var ProgressBar = require('progress');
Twer = require('./src/twer');
Excel = require('./src/excel');
Email = require('./src/email');

var readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Please input the Twer ID to send the payroll: ", function(twerId) {
    var twerIds = twerId.split(/[,;]/).filter(function (id) {
        return id != '';
    }).map(function (id) {
        return id.trim();
    });
    run(twerIds);
    rl.close();
});

function run(requesters) {
    Excel.open();
    var twerIds = [];
    if(requesters.length == 0) {
        console.log('Start to broadcast payroll.');
        Excel.eachRow(function(row) {
            if(row['Employee ID']) {
                twerIds.push(row['Employee ID'].trim());
            }
        });
    } else {
        console.log('Start to send payroll to', requesters);
        twerIds = requesters;
    }

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
        Twer.save();
        var didntSend = [];
        var totalCount = twerIds.length;

        var bar = new ProgressBar('  Sending email [:bar] :percent', {
            complete: '=',
            incomplete: ' ',
            width: 20,
            total: totalCount
        });
        var processedCount = 0;
        function progress(bar) {
            processedCount += 1;
            bar.tick(1);
        }

        function summary() {
            if(processedCount >= totalCount) {
                if(didntSend.length) console.log('Payroll of twer', didntSend, 'cannot be sent.');
            }
        }

        twerIds.forEach(function(twerId) {
            var row = getRowFromExcel(twerId);
            var twer = Twer.getTwer(twerId);
            if(twer && row) {
                Email.send(twer, row, Excel.titles(), function() {
                    progress(bar);
                    summary();
                });
            } else {
                progress(bar);
                didntSend.push(twerId);
            }
        });
        summary();
    }

    function getRowFromExcel(id) {
        var target = null;
        Excel.eachRow(function(row, i) {
            var twerID = (row['Employee ID'] || '').trim();
            if(twerID == id) {
                target = row;
                return false;
            }
        });
        return target;
    }
}

