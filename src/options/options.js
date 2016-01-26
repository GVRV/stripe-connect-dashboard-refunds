// Saves options to chrome.storage.sync.
function save_options() {
  var testKey = document.getElementById('test_api_key').value;
  var liveKey = document.getElementById('live_api_key').value;
  chrome.storage.sync.set({
    "testKey": testKey,
    "liveKey": liveKey
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    testKey: '',
    liveKey: ''
  }, function(items) {
    document.getElementById('test_api_key').value = items.testKey;
    document.getElementById('live_api_key').value = items.liveKey;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);

