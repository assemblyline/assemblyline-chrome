require("./helpers");
var _ = require('lodash');
var client = require('./client');
var commitStatusTemplate = require("./commit_status.hbs");
var deployButtonTemplate = require("./deploy_button.hbs");
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
  setTimeout(function(){ startUpdates(false); }, 60000);
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
  renderDeployButton(el, commit);
  renderDeployStatus(el, commit);
}

function renderCommitStatus(el, commit) {
  if (commit.commitStatus === undefined) { return; }
  if (commit.commitStatus.total_count === 0) { return; }
  hydrate(
    el.getElementsByClassName('commit-meta')[0],
    'commit-indicator',
    commitStatusTemplate(commit.commitStatus)
  )
}

function renderDeployButton(el, commit) {
  if (commit.commitStatus === undefined) { return; }
  if (commit.commitStatus.total_count === 0) { return; }
  if (commit.commitStatus.state !== 'success') { return; }
  var build = _(commit.commitStatus.statuses).filter({ context: 'assemblyline/build', state: 'success' }).first()
  if (build) {
    build.defaultDescription = el.getElementsByClassName("message")[0].title;
    build.shortSha = el.getElementsByClassName("sha")[0].text.trim()
    build.environments = ["staging", "production","sandbox"];
    build.image = build.target_url.split('//')[1];
    hydrate(
      el.getElementsByClassName('commit-links-cell')[0],
      'deploy-button',
      deployButtonTemplate(build)
    )
    attachDeployListner(el, build, commit);
  }
}

function attachDeployListner(el, build, commit) {
  var submit = el.getElementsByClassName('deploy-submit')[0]
  submit.addEventListener('click', function() {
    submit.disabled = true;
    el.getElementsByClassName("form")[0].style = "display:none";
    el.getElementsByClassName("loading")[0].style = "";
    var description = el.getElementsByClassName("deploy-description")[0].value;
    var environment = el.getElementsByClassName("deploy-environment")[0].value;
    client.POST(client.endpoint + repo + '/deployments', {
      ref:         commit.sha,
      payload:     { image: build.image },
      environment: environment,
      description: description,
      auto_merge:  false,
    }, function() {
      update(commit.sha, false);
    })
  })
}

function renderDeployStatus(el, commit) {
  if (commit.deployments === undefined) { return; }
  if (commit.deployments.length === 0) { return; }
  hydrate(
    el.getElementsByClassName('table-list-cell')[1],
    'deploy-links-group',
    deployStatusTemplate({
      environments: environments(commit),
    })
  )
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

function hydrate(container, className, content) {
  var wrapper = container.getElementsByClassName(className)[0];
  if (wrapper === undefined) {
    wrapper = document.createElement('div');
    wrapper.className = className;
    container.appendChild(wrapper);
  }
  wrapper.innerHTML = content;
}
