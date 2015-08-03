var Mailer = require('nodemailer');
var mailConfig = require('../config/mail.json');
var transporter = Mailer.createTransport({
    service: 'Gmail',
    auth: {
        user: mailConfig.user,
        pass: mailConfig.pass
    }
});

function emailTemplate(twer, salary, salaryTitle) {

    function greeting(twer) {
        return "<p>Hello " + twer.name + ", here is your payroll.</p>";
    }

    function salaryTable(salary, salaryTitle) {
        var keys = Object.keys(salaryTitle);
        var groupCount = Math.ceil(keys.length / 12);

        var content = '';
        for (var i = 0; i < groupCount; i++) {
            var subKeys = keys.slice(i * 12, (i + 1) * 12);
            content += '<table style="border:1px solid black;margin-bottom:10px;">'
                + '<thead style="background-color: grey;">'
                + '<tr>'
                + subKeys.map(function (t) {
                    return '<th style="width: 80px;border: 1px solid black;text-align: center;">' + salaryTitle[t] + '</th>'
                }).join('')
                + '</tr>'
                + '</thead>'
                + '<tbody>'
                + '<tr>'
                + subKeys.map(function (t) {
                    return '<td style="border: 1px solid black;text-align: center;">' + (salary[t] || '&nbsp;') + '</td>'
                }).join('')
                + '</tr>'
                + '</tbody>'
                + '</table>'
        }

        return content;
    }

    function techSupport() {
        return "<p>Technical supported by Wenbo Fan.</p>";
    }

    return "<html><body>" + greeting(twer) + '' + salaryTable(salary, salaryTitle) + techSupport() + "</body></html>";
}

function send(twer, salary, salaryTitle, cb) {
    var mailOptions = {
        from: mailConfig.from,
        to: twer.mail,
        subject: 'Payroll',
        html: emailTemplate(twer, salary, salaryTitle)
    };

    transporter.sendMail(mailOptions, cb);
}


module.exports = {
    send: send
};
