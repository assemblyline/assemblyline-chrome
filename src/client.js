module.exports.GET = function (url, etags, callback) {
  chrome.storage.local.get({token: ''}, function(creds) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          etags[url] = xhr.getResponseHeader("ETag");
          callback(JSON.parse(xhr.responseText))
        };
      };
    };

    xhr.open("GET", url, true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + creds.token); 
    xhr.setRequestHeader('Accept', 'application/vnd.github.ant-man-preview+json');
    if(etags[url]) {
      xhr.setRequestHeader('If-None-Match', etags[url]);
    };
    xhr.send();
  });
}

module.exports.POST = function (url, payload, callback) {
  chrome.storage.local.get({token: ''}, function(creds) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
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
