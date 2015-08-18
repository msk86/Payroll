var Twers = require('./script/twer');
var Email = require('./script/email');
var Payroll = require('./script/payroll');

function toggleCheckbox(name, value) {
    var elements = document.getElementsByName(name);
    for (var i = 0; i < elements.length; i++) {
        if ((elements[i].type == "checkbox")) {
            elements[i].checked = value;
        }
    }
}

function fetchTwerNameInPayroll(twer) {
    var payroll = Payroll.findByTwer(twer);
    if (payroll == undefined) {
        return "not existed";
    } else {
        return payroll["English Name"];
    }
}

function setDataSourceToTwersTable(twers){
    $('#twers-table').DataTable({
        destroy: true,
        "data": $.map(twers, function (v, k) {
            v["nameInPayroll"] = fetchTwerNameInPayroll(v);
            return v;
        }),
        "columns": [
            {
                "data": function (twer) {
                    return "<input type='checkbox' name='selected-twer' value='" + twer["twId"] + "'/>";
                }
            },
            { "data": "twId" },
            { "data": "name" },
            { "data": "mail" },
            { "data": "nameInPayroll" }
        ]});
}

$(function () {
    $("#select-all").on("click", function () {
        if ($("#select-all")[0].checked == true) {
            toggleCheckbox('selected-twer', true);
        } else {
            toggleCheckbox('selected-twer', false);
        }
    });

    $("#send-payroll").on("click", function () {
        var sendEmailErrors = [];
        var selectedTwers = $("input[name='selected-twer']:checked");
        var alreadySend = 0;

        function summary() {
            $('.spinner-loader').hide();
            alreadySend = +1;

            if (alreadySend == selectedTwers.length) {
                if (sendEmailErrors.length > 0) {
                    window.alert("Send email error: \n" + sendEmailErrors);
                } else {
                    window.alert("Send email successfully");
                }
            }
        }

        function noSelectedTwers() {
            return selectedTwers.length == 0;
        }

        if (noSelectedTwers()) {
            window.alert("No twers selected, please select twers firstly!")
        } else {
            selectedTwers.each(function () {
                $('.spinner-loader').show();

                var twer = Twers.findById($(this).val());
                var payRoll = Payroll.findByTwer(twer);

                if (payRoll) {
                    Email.send(twer, payRoll, Payroll.titles(), function (error) {
                        if (error) {
                            sendEmailErrors.push("Mail send to " + twer.mail + " failed by: " + error.message);
                        }
                        summary();
                    })
                } else {
                    sendEmailErrors.push("Mail send to " + twer.mail + " failed by: no existed payRoll");
                    summary();
                }
            })
        }
    });

    $("#sync-twer").on("click",function(){
        Twers.syncAll(function(){
            setDataSourceToTwersTable(Twers.all());
            window.alert("Sync twers successfully!");
        })
    });

    $('input:file').on('change', function () {
        Payroll.open(this.value);

        $('#twers-div').removeClass("hidden");
        $('#sync-and-send').removeClass("hidden");

        setDataSourceToTwersTable(Twers.all());
    });

    $('#update-sender-info .update-button .update').on("click", function () {
        var email = $('#update-sender-info .update-sender-email input').val();
        var password = $('#update-sender-info .update-sender-password input').val();

        if (email == '' || password == '') {
            window.alert("Please input correct info!");
        } else {
            Email.updateSenderInfo(email, password);
            $('#update-sender-info').addClass('hidden');
            $('#upload-payroll').removeClass('hidden');
        }
    });

    $('#update-sender-info .update-button .skip').on("click", function () {
        $('#update-sender-info').addClass('hidden');
        $('#upload-payroll').removeClass('hidden');
    });
});