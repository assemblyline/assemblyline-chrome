var Handlebars = require('handlebars-template-loader/runtime');
var stateIconTemplate = require("./state_icon.hbs");
var _ = require('lodash');

Handlebars.registerHelper('scale', function(n, factor) {
  return n * factor;
});

Handlebars.registerHelper('stateIcon', function(state, scale) {
  if (state) {
    var icon = {
      success: {
        css:   'octicon-check',
        path:  'M12 5L4 13 0 9l1.5-1.5 2.5 2.5 6.5-6.5 1.5 1.5z',
        width:  12,
        height: 16,
        state: 'success',
      },
      pending: {
        css:   'octicon-primitive-dot',
        path:  'M0 8c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4S0 10.2 0 8z',
        width:  8,
        height: 16,
        state: 'pending',
      },
      error: {
        css:   'octicon-x',
        path:  'M7.48 8l3.75 3.75-1.48 1.48-3.75-3.75-3.75 3.75-1.48-1.48 3.75-3.75L0.77 4.25l1.48-1.48 3.75 3.75 3.75-3.75 1.48 1.48-3.75 3.75z',
        width:  12,
        height: 16,
        state: 'error',
      },
      failure: {
        css:   'octicon-x',
        path:  'M7.48 8l3.75 3.75-1.48 1.48-3.75-3.75-3.75 3.75-1.48-1.48 3.75-3.75L0.77 4.25l1.48-1.48 3.75 3.75 3.75-3.75 1.48 1.48-3.75 3.75z',
        width:  12,
        height: 16,
        state: 'failure',
      },
      inactive: {
        css: 'octicon-primitive-dot',
        path: 'M0 8c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4S0 10.2 0 8z',
        width:  8,
        height: 16,
        state: 'inactive',
      },
    }[state];
    if (isNaN(scale)) {
      icon.size = 1;
    } else {
      icon.size = scale;
    }
    return new Handlebars.SafeString(stateIconTemplate(icon));
  }
});

Handlebars.registerHelper('stateHeading', function(state) {
  switch (state) {
    case "success":
      return 'All checks have passed';
    case "pending":
      return 'Some checks haven’t completed yet';
    default:
      return 'Some checks were not successful';
  }
})

Handlebars.registerHelper('deployStateHeading', function(state, environment) {
  switch (state) {
    case "success":
      return 'Sucessfuly deployed to ' + environment;
    case "pending":
      return 'Deployment to ' + environment + ' is in progress';
    case "inactive":
      return 'No longer deployed to ' + environment;
    default:
      return 'There were issues with the deployment to ' + environment;
  }
})

Handlebars.registerHelper('stateTooltip', function(statuses) {
  if (statuses) {
    var ok = 0;
    _.forEach(statuses, function(s) {
      if (s.state === "success") {
        ok++;
      }
    });
    return ok + ' / ' + statuses.length + ' checks OK';
  }
});

Handlebars.registerHelper('relTime', function(time) {
  return new Handlebars.SafeString(
    '<relative-time datetime="' + time + '" '
    + 'title="' + time + '" class="timestamp">'
    + time + '</relative-time>'
  )
})
