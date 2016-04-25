var _      = require('lodash');
var client = require('./client');

chrome.storage.local.get({
    commits: {},
    cache: {},
}, function(items) {
  client.cache    = items.cache;
  var urlFilter = {url: [{hostSuffix: 'github.com', urlContains: 'commits'}]};

  // When the page suspends, we store the etag cache
  chrome.runtime.onSuspend.addListener(function() {
    chrome.storage.local.set({
      cache:   client.cache,
    });
  })

  chrome.runtime.onMessage.addListener(
    function(commit) {
      if (commit.sha === undefined) { return; }
      if (commit.repo === undefined) { return; }
      getData(commit);
    }
  );

  chrome.webNavigation.onHistoryStateUpdated.addListener(function(e) {
    chrome.tabs.sendMessage(e.tabId, "init");
  }, urlFilter);

  chrome.webNavigation.onDOMContentLoaded.addListener(function(e) {
    chrome.tabs.sendMessage(e.tabId, "init");
  }, urlFilter);

  function getData(commit) {
    commitStatus(_.clone(commit));
    deployments(_.clone(commit));
  }

  function commitStatus(commit) {
    client.GET(client.endpoint + commit.repo + '/commits/' + commit.sha + '/status', function(data){
      commit.commitStatus = data;
      saveCommit(commit);
    });
  }

  function deployments(commit) {
    client.GET(client.endpoint + commit.repo + '/deployments?sha=' + commit.sha, function(data){
      commit.deployments = _.sortBy(data, function(d) { return - Date.parse(d.updated_at) });
      deploymentStatuses(commit);
    });
  }

  function deploymentStatuses(commit) {
    if (commit.deployments) {
      _.forEach(commit.deployments, function(deployment) {
        client.GET(deployment.statuses_url, function(statuses){
          deployment.statuses = _.sortBy(statuses, function(s) { return - Date.parse(s.updated_at) });
          if (deployment.statuses.length > 0 ) {
            deployment.state = deployment.statuses[0].state;
          } else {
            deployment.state = 'pending'
          }
          if (_.every(commit.deployments, 'statuses')) {
            saveCommit(commit);
          }
        });
      });
    }
  }

  function saveCommit(commit) {
    var key = commit.repo + '/' + commit.sha;
    if (commit.commitStatus) { key = key + '/' + 'status'; }
    if (commit.deployments) { key = key + '/' + 'deployments'; }
    var save = {
      // store the etag cache
      cache: client.cache
    };
    save[key] = commit;
    chrome.storage.local.set(save);
  }
});
