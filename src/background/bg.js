var re = /^https:\/\/dashboard\.stripe\.com\/(test\/)?applications\/fees\/fee_\w+$/;

chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
    console.log('Background: History changed!');
    var url = details.url;
    if (!url || !re.test(url)) return;

    console.log('Background: Sending event!');
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {stripe_fee_page: true});
    });
});
