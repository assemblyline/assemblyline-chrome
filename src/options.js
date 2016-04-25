function saveOptions() {
  var token = document.getElementById('token').value;
  chrome.storage.local.set({
    token: token,
  }, function() {
    document.body.innerHTML = '<h3>Options saved</h3>';
    setTimeout(function() { window.close(); }, 600);
  });
}
document.getElementById('save').addEventListener('click', saveOptions);

function restoreOptions() {
  chrome.storage.local.get({
    token: '',
  }, function(items) {
    document.getElementById('token').value = items.token;
  });

  chrome.storage.local.getBytesInUse('cache', function(bytes) {
    document.getElementById('cache-info').innerHTML = 'Cache size: ' + Math.round(bytes / 1024)  + ' KiB';
  })
}
document.addEventListener('DOMContentLoaded', restoreOptions);

function clearCache() {
  chrome.storage.local.set({
    cache: {},
  }, function() {
    restoreOptions();
    document.getElementById('cache').innerHTML = '<b>Cache Cleared</b>';
  });
}
document.getElementById('cache').addEventListener('click', clearCache);
