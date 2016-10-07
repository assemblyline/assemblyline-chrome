require("./helpers");
var _ = require('lodash');
var client = require('./client');
var deployButtonTemplate = require("./deploy_button.hbs");
var deployStatusTemplate = require("./deploy_status.hbs");
var deployStatusButtonTemplate = require("./deploy_status_button.hbs");
var deployStatusMenuTemplate = require("./deploy_status_menu.hbs");
var repo = document.location.pathname.match(/([^\/]+\/[^\/]+)/)[0]

chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (key in changes) {
      render(changes[key].newValue);
  }
})

chrome.runtime.onMessage.addListener(function(message) {
  if(message === "init") { 
    shas().each(function(sha) {
      chrome.storage.local.get([
        repo + '/' + sha + '/' + 'status',
        repo + '/' + sha + '/' + 'deployments',
      ], function(items) {
        for (key in items) {
          render(items[key]);
        }
      });
    })
    loadPage();
    updateActive()
  }
})

// Request the backend loads the data for each sha on the page.
function loadPage() {
  shas().each(function(sha) { update(sha); })
}

// Request the backend updates the data for each sha with an active dropdown
// every second.
function updateActive() {
  shas().each(function(sha) {
    if(_.size(shaContainer(repo, sha).getElementsByClassName("active")) > 0) {
      update(sha);
    }
  })
  setTimeout(function(){
    updateActive();
  }, 1000);
}

function shas() {
  return _(document.getElementsByClassName("commit")).map(function(commit) {
    return commit.dataset.channel.split(':')[5];
  });
}

function shaContainer(repo, sha) {
  return document.querySelector('[href="/' + repo + '/commit/' + sha + '"]').parentNode.parentNode.parentNode;
}

function update(sha) {
  chrome.runtime.sendMessage({
    repo: repo,
    sha: sha,
  })
}

function render(commit) {
  if (commit === undefined) { return; }
  if (commit.sha === undefined) { return; }
  if (commit.repo !== repo) { return; }
  var el = shaContainer(commit.repo, commit.sha);
  if (commit.commitStatus) {
    renderDeployButton(el, commit);
  }
  if (commit.deployments) {
    renderDeployStatus(el, commit);
  }
}

function renderDeployButton(el, commit) {
  chrome.storage.local.get({
    environments: ['staging','production'],
  }, function(config) {
    if (commit.commitStatus === undefined) { return; }
    if (commit.commitStatus.total_count === 0) { return; }
    if (commit.commitStatus.state !== 'success') { return; }
    var build = _(commit.commitStatus.statuses).filter({ context: 'assemblyline/build', state: 'success' }).first()
    if (build) {
      build.defaultDescription = el.getElementsByClassName("message")[0].title;
      build.shortSha = el.getElementsByClassName("sha")[0].text.trim()
      build.environments = config.environments;
      build.image = build.target_url.split('//')[1];
      hydrate(
        el.getElementsByClassName('commit-links-cell')[0],
        'deploy-button',
        deployButtonTemplate(build)
      )
      attachDeployListner(el, build, commit);
    }
  });
}

function attachDeployListner(el, build, commit) {
  var submit = el.getElementsByClassName('deploy-submit')[0]
  submit.addEventListener('click', function() {
    submit.disabled = true;
    var loading = el.getElementsByClassName("loading")[0];
    var dropdown = el.getElementsByClassName('dropdown-deploy-button')[0]

    var description = el.getElementsByClassName("deploy-description")[0].value;
    var environment = el.getElementsByClassName("deploy-environment")[0].value;

    loading.removeAttribute('style')

    client.POST(client.endpoint + repo + '/deployments', {
      ref:         commit.sha,
      payload:     { image: build.image },
      environment: environment,
      description: description,
      auto_merge:  false,
    }, function() {
      submit.disabled = false;
      loading.setAttribute('style', 'display:none')
      el.getElementsByClassName('dropdown-deploy-button')[0].classList.remove('active');
      showDeployProgress(el, environment);
    })
  })
}

function showDeployProgress(el, environment) {
  renderEnvironment(el, { name: environment, state: 'pending', deployments: []});
  el.getElementsByClassName('deploy-' + environment)[0].getElementsByClassName('js-menu-target')[0].click();
}

function renderDeployStatus(el, commit) {
  if (commit.deployments === undefined) { return; }
  if (commit.deployments.length === 0) { return; }
  _.forEach(environments(commit), function(environment) { renderEnvironment(el, environment); });
}

function renderEnvironment(el, environment) {
  hydrate(
      el.getElementsByClassName('table-list-cell')[1],
      'dropdown dropdown-deploy js-menu-container deploy-' + environment.name,
      deployStatusTemplate(environment),
      true
  );
  var wrapper = el.getElementsByClassName('deploy-' + environment.name)[0];
  hydrate(
      wrapper,
      'environment-button-container',
      deployStatusButtonTemplate(environment)
  );
  hydrate(
      wrapper,
      'dropdown-menu dropdown-menu-se',
      deployStatusMenuTemplate(environment)
  );
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

function hydrate(container, className, content, once) {
  var wrapper = container.getElementsByClassName(className)[0];
  if (wrapper === undefined) {
    wrapper = document.createElement('div');
    wrapper.className = className;
    container.appendChild(wrapper);
    if (once) {
      wrapper.innerHTML = content;
    }
  }
  if (!once) {
    wrapper.innerHTML = content;
  }
}
