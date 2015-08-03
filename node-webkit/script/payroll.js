var XLSX = require('xlsx');
var data = null;

function removeLineBreak(data) {
    var newData = {};
    for (var k in data) {
        newData[k.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ')] = data[k];
    }
    return newData;
}

function rows() {
    return data.slice(1).map(function (r, i) {
        var newRow = removeLineBreak(r);
        if (newRow['Employee ID']) {
            newRow['Employee ID'] = newRow['Employee ID'].trim();
        } else {
            newRow['Employee ID'] = '';
        }
        newRow.rowNumber = i + 3;
        return newRow;
    });
}

function findByTwer(twer) {
    return rows().filter(function (r) {
        return r['Employee ID'] == twer.twId;
    })[0];
}

function titles() {
    return removeLineBreak(data[0]);
}

function open(file_path) {
    var workbook = XLSX.readFile(file_path);
    var first_sheet_name = workbook.SheetNames[0];
    var worksheet = workbook.Sheets[first_sheet_name];
    data = XLSX.utils.sheet_to_json(worksheet);
}

module.exports = {
    findByTwer: findByTwer,
    titles: titles,
    open: open
};