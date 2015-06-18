var XLSX = require('xlsx');

var data = null;

function open() {
    console.log('Opening payroll.xlsx.');
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

function rows() {
    return data.slice(1).map(function(r, i) {
        var newRow = removeLineBreak(r);
        if(newRow['Employee ID']) {
            newRow['Employee ID'] = newRow['Employee ID'].trim();
        } else {
            newRow['Employee ID'] = '';
        }
        newRow.rowNumber = i + 3;
        return newRow;
    });
}

function rowCount() {
    return data.length - 1;
}


module.exports = {
    open: open,
    titles: titles,
    rows: rows,
    rowCount: rowCount
};
