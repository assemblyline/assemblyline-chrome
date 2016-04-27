# Assemblyline
## Chrome Extension

The assemblyline chrome extension is built to enable a workflow where
applications built using _Assemblyline_ can be deployed from within the github
web interface.

This is enabled by adding 3 missing features to the github web interface.

### Commit Statuses extended to all commit listings

Github provides a nice interface to view 
[commit statuses](https://developer.github.com/v3/repos/statuses/) in pull
requests.  We want a workflow where we can view the commit statuses on all
branches. The extension re-impliments the functionality avalible on the commit
view of pull requests in the standard branch centric commit view.

This means that before deploying a particular commit from master (or any other
branch) we can check that CI tasks have been sucessfull.

### Deploy Button

Where a commit has passing commit statuses, and url for a docker image
is avalible in the `target_url` field of a commit status with
the `assemblyline/build` context, UI is provided to request a deployment
via the [deployments api](https://developer.github.com/v3/repos/deployments/)

This UI shows the url of the docker image, and allows the user to choose
the environment (i.e. kubentes namespace to deploy the application to)
and a description of the deployment (defaulted to the current commit message)
As this UI is only coupled to the github deployments API, it is possible
to experiment with diferent tools that will actuly make the deployment
happen. A deployment tool that will be configured using `Assemblyfile`
is in development.

### Deploy Statuses

The extension also provides an overview (and detailed info) about the status of
active and historical deployments to each environment. This allows deployment
tools to provide feedback to the user via the
[deployments api](https://developer.github.com/v3/repos/deployments/#create-a-deployment-status).
The `environment_url` and `log_url` fields are also exposed to the user, in
order that a deployment tool can where appropriate provide a link to the
deployed application as well as a link to an interface where log and
diagnostic information could be provided.

## Instalation and Setup

The extension can be installed from the
[chrome web store](https://chrome.google.com/webstore/detail/assemblyline/lonliokafoameogdmjckeogjejlbplgc).

Once installed you will need to create a github
[personal access token](https://github.com/settings/tokens) so that the
extension is able to connect to the github api.  Currently the extension only
needs access to the `repo:status` and `repo_deployment` scopes, it is good
practice to only give the extension access to these scopes.

Once you have created your access token, visit the [chrome extensions settings page](chrome://extensions/)
and click on the options link in the Assemblyline extension. There you will be able to
configure the token used by the extension.

## Development

The extension is built with [webpack](https://webpack.github.io/).

To build a zip file ready to upload to the chrome webstore do this:

```
npm install
npm run build
```

If you want to hack on the code:

```
npm install
npm run watch
```

Then visit [chrome extensions settings page](chrome://extensions/) and click on
"Load unpacked extension..." and navigate to the `build` directory.
Webpack will rebuild whenever you change a file, but you must reload the
extension in the [chrome extensions settings page](chrome://extensions/) before
your changes will take effect in the browser.

## TODO

* Testing
* More modular and decoupled code
* Look into using React
* Add any features that are required once the deployment tool is completed

## LICENSE

This code is licensed under an [MIT licence](./LICENSE). If causes you any
dificulty in using the code, let us know as we are happy to add any (reasonable)
licence as required.

## Contibuting

* Contributions are very welcome, and we will do everything we can to help you do so.
* This project is released with a [Contributor Code of Conduct](./CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.
* Here are things you can do to help:
  * Open An Issue.
  * Add a feature.
  * Make the code better.
