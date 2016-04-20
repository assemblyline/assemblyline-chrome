function save_options() {
  var token = document.getElementById('token').value;
  chrome.storage.local.set({
    token: token,
  }, function() {
    document.body.innerHTML = '<h3>Options saved</h3>';
    setTimeout(function() { window.close(); }, 600);
  });
}

function restore_options() {
  chrome.storage.local.get({
    token: '',
  }, function(items) {
    document.getElementById('token').value = items.token;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);

