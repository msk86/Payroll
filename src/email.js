var Mailer = require('nodemailer');
var mailConfig = require('../res/mail.json');

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

var transporter = Mailer.createTransport({
    service: 'Gmail',
    auth: {
        user: mailConfig.user,
        pass: mailConfig.pass
    }
});

function send(email, content, gateOpen, cb) {
    var mailOptions = {
        from: mailConfig.from,
        to: email,
        subject: 'Payroll',
        html: content
    };

    if(gateOpen) {
        transporter.sendMail(mailOptions, cb);
    } else {
        setTimeout(function() {
            cb();
        }, Math.random() * 3000);
    }

}

module.exports = {
    gateOpen: false,
    send: function (twer, salary, salaryTitle, cb) {
        var self = this;
        send(twer.mail, emailTemplate(twer, salary, salaryTitle), self.gateOpen, cb);
    }
};
