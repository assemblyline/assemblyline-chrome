var _      = require('lodash');
var client = require('./client');

chrome.storage.local.get({
    commits: {},
    cache: {},
}, function(items) {
  var commits  = items.commits;
  client.cache    = items.cache;
  var urlFilter = {url: [{hostSuffix: 'github.com', urlContains: 'commits'}]};

  // When the page suspends, we store the cached state.
  chrome.runtime.onSuspend.addListener(function() {
    chrome.storage.local.set({
      commits: commits,
      cache:   client.cache,
    });
  })

  chrome.runtime.onMessage.addListener(
    function(request, sender) {
      getData(request, function(commit) {
        chrome.tabs.sendMessage(sender.tab.id, commit);
      })
    }
  );

  chrome.webNavigation.onHistoryStateUpdated.addListener(function(e) {
    chrome.tabs.sendMessage(e.tabId, "init");
  }, urlFilter);

  chrome.webNavigation.onDOMContentLoaded.addListener(function(e) {
    chrome.tabs.sendMessage(e.tabId, "init");
  }, urlFilter);

  function getData(request, callback) {
    if (request.init) {
      if (findCommit(request)) {
        callback(commitFor(request));
      }
    }

    commitStatus(request, callback);
    deployments(request, callback);
  }

  function commitStatus(request, callback) {
    client.GET(client.endpoint + request.repo + '/commits/' + request.sha + '/status', function(data){
      var commit = commitFor(request);
      commit.commitStatus = data;
      saveCommit(commit);
      callback(commit);
    });
  }

  function deployments(request, callback) {
    client.GET(client.endpoint + request.repo + '/deployments?sha=' + request.sha, function(data){
      var commit = commitFor(request);
      commit.deployments = _.sortBy(data, function(d) { return - Date.parse(d.updated_at) });
      deploymentStatuses(commit, callback);
    });
  }

  function deploymentStatuses(commit, callback) {
    if (commit.deployments) {
      _.forEach(commit.deployments, function(deployment) {
        client.GET(deployment.statuses_url, function(statuses){
          deployment.statuses = _.sortBy(statuses, function(s) { return - Date.parse(s.updated_at) });
          if (deployment.statuses.length > 0 ) {
            deployment.state = deployment.statuses[0].state;
          } else {
            deployment.state = 'pending'
          }
          if (_.every(commit.deployment, 'statuses')) {
            saveCommit(commit);
            callback(commit);
          }
        });
      });
    }
  }

  function saveCommit(commit) {
    commits[commit.repo + '/' + commit.sha] = commit;
  }

  function commitFor(request) {
    var commit = findCommit(request);
    if (commit) {
      return commit;
    } else {
      return {
        repo:  request.repo,
        sha:   request.sha,
      }
    }
  }

  function findCommit(request) {
    return commits[request.repo + '/' + request.sha];
  }
});
