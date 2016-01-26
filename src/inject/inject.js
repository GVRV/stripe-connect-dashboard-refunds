var testRe = /^https:\/\/dashboard\.stripe\.com\/test\/applications\/fees\/fee_\w+$/;

var addCompleteRefund = function () {
    console.log('Content: Main function!');
    if (!$('#refund').length) return;

    // Find the charge section
    var charge_section = $('h3').filter(function (idx, el) { return $(el).text().trim() === 'Charge Details'; });

    // Bail if we cannot find the charge section
    if (!charge_section || !charge_section.length) {
        return;
    }

    // Find the account section
    var account_section = $('h3').filter(function (idx, el) { return $(el).text().trim() === 'Account Details'; });

    if (!account_section || !account_section.length) {
        return;
    }

    // Get the charge ID from the charge section
    var chargeId = $(charge_section[0]).next().find('a').text().trim();
    // Get the account ID from the account section
    var accountId = $(account_section[0]).next().find('a').text().trim();

    if (!chargeId || !accountId) return;

    // Add the new button, remove the old button
    $('#refund').after('<a id="total-refund" href="#" class="button medium grey"><span>Refund Fee Completely</span></a>').remove();

    // Bind the click event on the total-refund button
    $('#total-refund').click(function(ev) {
        ev.preventDefault();

        // Get the API Keys settings
        chrome.storage.sync.get({
            testKey: '',
            liveKey: ''
        }, function(items) {
            // Get the correct key by looking at the URL
            var key = testRe.test(window.location.href) ? items.testKey : items.liveKey;

            // Check that the key value exists
            if (!key) {
                window.alert('Please set the API Key using the options page for the extension available at chrome://extensions');
                return;
            }

            // Send the API request for the refund
            $('#total-refund').off('click');
            $.ajax({
                url: 'https://api.stripe.com/v1/charges/' + chargeId + '/refunds',
                type: 'POST',
                headers: {
                    "Authorization": "Bearer " + key,
                    "Stripe-Account": accountId
                },
                data: {
                    refund_application_fee: 'true',
                },
                success: function (response) {
                    console.log(response);
                    $('#total-refund').after('<a class="button grey medium disabled"><span>Refunded</span></a>').remove();
                },
                error: function (response) {
                    window.alert('Refund request failed. Information:\n\n' + response.responseText + '\n\nPlease refresh the page and try again.');
                }
            });
        });
    });
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (sender.tab) return;
    console.log('Content: Received Event!');
    if (request.stripe_fee_page) {
        var pageChangeInterval = setInterval(function () {
            if ($('#refund').length) {
                clearInterval(pageChangeInterval);
                addCompleteRefund();
            }
        }, 10);
        setTimeout(function () {clearInterval(pageChangeInterval);}, 1000);
    }
});

chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
        if (document.readyState === "complete" && $('#refund').length) {
            clearInterval(readyStateCheckInterval);
            console.log('Content: On load!');
            addCompleteRefund();
        }
	}, 10);
    setTimeout(function() { clearInterval(readyStateCheckInterval);}, 1000);
});
