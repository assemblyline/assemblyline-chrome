require("./helpers");
var _ = require('lodash');
var commitStatusTemplate = require("./commit_status.hbs");
var deployStatusTemplate = require("./deploy_status.hbs");
var repo = document.location.pathname.match(/([^\/]+\/[^\/]+)/)[0]

chrome.runtime.onMessage.addListener(function(message) {
  if(message === "init") {
    startUpdates(true);
  } else {
    render(message);
  }
})

function startUpdates(init) {
  shas().forEach( function(sha) { update(sha, init); })
  setTimeout(function(){ startUpdates(false); }, 5000);
}

function shas() {
  return _.map(document.getElementsByClassName("commit"), function(commit) {
    return commit.dataset.channel.split(':')[2];
  });
}

function update(sha, init) {
  chrome.runtime.sendMessage({
    init: init,
    repo: repo,
    sha: sha,
  })
}

function render(commit) {
  if (commit.repo !== repo) { return; }
  var el = document.querySelector('[data-channel="' + commit.repo + ':commit:' + commit.sha + '"]');
  renderCommitStatus(el, commit);
  renderDeployStatus(el, commit);
}

function renderCommitStatus(el, commit) {
  if (commit.commitStatus === undefined) { return; }
  if (commit.commitStatus.total_count === 0) { return; }
  var commitIndicator = el.getElementsByClassName("commit-indicator")[0];
  if (commitIndicator === undefined) {
    commitIndicator = document.createElement('span');
    commitIndicator.className = 'commit-indicator';
    el.getElementsByClassName("commit-meta")[0].appendChild(commitIndicator);
  } 
  commitIndicator.innerHTML = commitStatusTemplate(commit.commitStatus);
}

function renderDeployStatus(el, commit) {
  if (commit.deployments === undefined) { return; }
  if (commit.deployments.length === 0) { return; }
  var cell = el.getElementsByClassName('table-list-cell')[1];
  var container = cell.getElementsByClassName('deploy-links-group')[0];
  if (container === undefined) {
    container = document.createElement('div');
    container.className = 'deploy-links-group';
    cell.appendChild(container);
  }
  container.innerHTML = deployStatusTemplate({
    environments: environments(commit),
  });
}

function environments(commit) {
  return _(commit.deployments).groupBy('environment').map(function(deployments, environment) {
    return {
      name: environment,
      deployments: deployments,
      state: deployments[0].state,
    };
  }).value();
}
