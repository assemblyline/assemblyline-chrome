var _      = require('lodash');
var client = {};
client.endpoint = 'https://api.github.com/repos/';
client.cache = {};

client.GET = function (url, callback) {
  chrome.storage.local.get({token: ''}, function(creds) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          client.cache[url] = { etag: xhr.getResponseHeader("ETag"), value: JSON.parse(xhr.responseText) };
          callback(_.clone(client.cache[url].value))
        } else if (xhr.status === 304) {
          callback(_.clone(client.cache[url].value))
        }
      };
    };

    xhr.open("GET", url, true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + creds.token); 
    xhr.setRequestHeader('Accept', 'application/vnd.github.ant-man-preview+json');
    if(client.cache[url]) { xhr.setRequestHeader('If-None-Match', client.cache[url].etag); };
    xhr.send();
  });
}

client.POST = function (url, payload, callback) {
  chrome.storage.local.get({token: ''}, function(creds) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          callback(JSON.parse(xhr.responseText))
        };
      };
    };

    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + creds.token); 
    xhr.setRequestHeader('Accept', 'application/vnd.github.ant-man-preview+json');
    xhr.send(JSON.stringify(payload));
  });
}

module.exports = client;
