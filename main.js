var ProgressBar = require('progress');
Twer = require('./src/twer');
Excel = require('./src/excel');
Email = require('./src/email');

var readline = require('readline');

Email.gateOpen = !!process.argv[2];

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Please input the Twer ID to send the payroll: ", function(twerId) {
    rl.pause();
    if(!twerId) {
        rl.question("Are your sure to broadcast payroll to everyone?[Y/N]", function(confirm) {
            rl.close();
            if(confirm === 'Y') {
                console.log('Start to broadcast payroll...');
                broadcastPayroll();
            } else {
                console.log('Bye~');
            }
        });
    } else {
        var twerIds = twerId.split(/[,;]/).filter(function (id) {
            return id != '';
        }).map(function (id) {
            return id.trim();
        });
        console.log('Start to send payroll to', twerIds);
        sendPayroll(twerIds);
    }
});

function broadcastPayroll() {
    function allTwerIdsFromExcel() {
        var twerIds = [];
        var noIdRows = [];

        Excel.rows().forEach(function(row) {
            var empId = row['Employee ID'];
            if(empId) {
                twerIds.push(empId);
            } else {
                noIdRows.push(row.rowNumber);
            }
        });

        if(noIdRows.length) console.log('Can not find Employee ID at line', noIdRows);
        return twerIds;
    }

    Excel.open();
    var twerIds = allTwerIdsFromExcel();
    syncAndSend(twerIds);
}

function sendPayroll(twerIds) {
    function filterTwerIdsFromExcel() {
        var inExcel = [];
        var notInExcel = [];

        var excelIds = Excel.rows().map(function(row) {
            return row['Employee ID'];
        });

        twerIds.forEach(function(id) {
            if(excelIds.indexOf(id) >= 0) {
                inExcel.push(id);
            } else {
                notInExcel.push(id);
            }
        });

        if(notInExcel.length) console.log('Twer ids which are not in the Excel:', notInExcel);
        return inExcel;
    }
    Excel.open();
    var twerIdsInExcel = filterTwerIdsFromExcel();
    syncAndSend(twerIdsInExcel)
}

function syncAndSend(twerIds) {
    function syncNewTwers(twerIds, syncFinish) {
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
    }

    function transformToTwer(twerIds) {
        var notInDbIds = [];
        var twers = twerIds.map(function(id) {
            var twer = Twer.getTwer(id);
            if(twer) {
                return twer;
            } else {
                notInDbIds.push(id);
            }
        });
        if(notInDbIds.length) console.log('Can not find twer email by id:', notInDbIds);
        return twers.filter(function(twer) {
            return !!twer;
        });
    }

    syncNewTwers(twerIds, function() {
        var twers = transformToTwer(twerIds);
        sendEmail(twers);
    });
}

function sendEmail(twers) {
    var errors = [];
    var totalCount = twers.length;
    var processedCount = 0;

    var bar = new ProgressBar('  Sending email [:bar] :percent', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: totalCount
    });

    function progress(bar) {
        processedCount += 1;
        bar.tick(1);
    }

    function progressDone() {
        return processedCount >= totalCount;
    }

    function summary() {
        if(progressDone()) {
            if(errors.length) {
                console.log('Error happens:');
                errors.forEach(function(e) {
                    console.log('  Error:', e);
                });
            }
        }
    }

    function getRowFromExcel(twer) {
        return Excel.rows().filter(function(r) {
            return r['Employee ID'] == twer.twId;
        })[0];
    }

    twers.forEach(function(twer) {
        var row = getRowFromExcel(twer);
        Email.send(twer, row, Excel.titles(), function(err) {
            if(err) {
                errors.push("Mail send to ", twer.mail, "failed by:", err);
            }
            progress(bar);
            summary();
        });
    });
}
