var XLSX = require('xlsx');

var data = null;

function open() {
    var workbook = XLSX.readFile(__dirname + '/../res/payroll.xlsx');

    var first_sheet_name = workbook.SheetNames[0];
    var worksheet = workbook.Sheets[first_sheet_name];

    data = XLSX.utils.sheet_to_json(worksheet);
}

function removeLineBreak(data) {
    var newData = {};
    for(var k in data) {
        newData[k.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ')] = data[k];
    }
    return newData;
}

function titles() {
    return removeLineBreak(data[0]);
}

function eachRow(cb) {
    data.slice(1).forEach(function(r, i) {
        cb(removeLineBreak(r), i+3);
    });
}

module.exports = {
    open: open,
    titles: titles,
    eachRow: eachRow
};

open();
//console.log(titles());
