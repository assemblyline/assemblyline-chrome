var _      = require('lodash');
var client = {};
client.endpoint = 'https://api.github.com/repos/';

client.GET = function (url, callback) {
  chrome.storage.local.get({token: '', cache: {}}, function(options) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          options.cache[url] = { etag: xhr.getResponseHeader("ETag"), value: JSON.parse(xhr.responseText) };
          chrome.storage.local.set({cache: options.cache});
          callback(_.clone(options.cache[url].value))
        } else if (xhr.status === 304) {
          callback(_.clone(options.cache[url].value))
        }
      };
    };

    xhr.open("GET", url, true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + options.token);
    xhr.setRequestHeader('Accept', 'application/vnd.github.ant-man-preview+json');
    if(options.cache[url]) { xhr.setRequestHeader('If-None-Match', options.cache[url].etag); };
    xhr.send();
  });
}

client.POST = function (url, payload, callback) {
  chrome.storage.local.get({token: ''}, function(options) {
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
    xhr.setRequestHeader('Authorization', 'Bearer ' + options.token);
    xhr.setRequestHeader('Accept', 'application/vnd.github.ant-man-preview+json');
    xhr.send(JSON.stringify(payload));
  });
}

module.exports = client;
