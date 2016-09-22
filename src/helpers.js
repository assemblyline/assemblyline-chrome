var Handlebars = require('handlebars-template-loader/runtime');
var iconTemplate = require("./icon.hbs");
var _ = require('lodash');

Handlebars.registerHelper('scale', function(n, factor) {
  return n * factor;
});

Handlebars.registerHelper('statusClass', function(state) {
  return "text-" + (
    {
      success: 'green',
      error:   'red',
      failure: 'red',
    }[state] || state
  );
})

Handlebars.registerHelper('icon', function(name, scale) {
  if (name) {
    var icon = {
      success: {
        css:   'octicon-check build-status-icon text-green',
        path:  'M12 5L4 13 0 9l1.5-1.5 2.5 2.5 6.5-6.5 1.5 1.5z',
        width:  12,
        height: 16,
      },
      pending: {
        css:   'octicon-primitive-dot build-status-icon text-pending',
        path:  'M0 8c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4S0 10.2 0 8z',
        width:  8,
        height: 16,
      },
      error: {
        css:   'octicon-x build-status-icon text-red',
        path:  'M7.48 8l3.75 3.75-1.48 1.48-3.75-3.75-3.75 3.75-1.48-1.48 3.75-3.75L0.77 4.25l1.48-1.48 3.75 3.75 3.75-3.75 1.48 1.48-3.75 3.75z',
        width:  12,
        height: 16,
      },
      failure: {
        css:   'octicon-x build-status-icon text-red',
        path:  'M7.48 8l3.75 3.75-1.48 1.48-3.75-3.75-3.75 3.75-1.48-1.48 3.75-3.75L0.77 4.25l1.48-1.48 3.75 3.75 3.75-3.75 1.48 1.48-3.75 3.75z',
        width:  12,
        height: 16,
      },
      inactive: {
        css: 'octicon-primitive-dot build-status-icon text-inactive',
        path: 'M0 8c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4S0 10.2 0 8z',
        width:  8,
        height: 16,
      },
      squirrel: {
        css: 'octicon-squirrel',
        path: 'M12 1c-2.21 0-4 1.31-4 2.92C8 5.86 8.5 6.95 8 10c0-4.5-2.77-6.34-4-6.34 0.05-0.5-0.48-0.66-0.48-0.66s-0.22 0.11-0.3 0.34c-0.27-0.31-0.56-0.27-0.56-0.27l-0.13 0.58c0 0-1.83 0.64-1.85 3.22C0.88 7.2 2.21 7.47 3.15 7.3c0.89 0.05 0.67 0.79 0.47 0.99C2.78 9.13 2 8 1 8s-1 1 0 1 1 1 3 1c-3.09 1.2 0 4 0 4h-1c-1 0-1 1-1 1s4 0 6 0c3 0 5-1 5-3.47 0-0.85-0.43-1.79-1-2.53C10.89 7.54 12.23 6.32 13 7s3 1 3-2C16 2.79 14.21 1 12 1zM2.5 6c-0.28 0-0.5-0.22-0.5-0.5 0-0.28 0.22-0.5 0.5-0.5 0.28 0 0.5 0.22 0.5 0.5C3 5.78 2.78 6 2.5 6z',
        width:  16,
        height: 16,
      },
      clippy: {
        css: 'octicon-clippy',
        path: 'M2 12h4v1H2v-1z m5-6H2v1h5v-1z m2 3V7L6 10l3 3V11h5V9H9z m-4.5-1H2v1h2.5v-1zM2 11h2.5v-1H2v1z m9 1h1v2c-0.02 0.28-0.11 0.52-0.3 0.7s-0.42 0.28-0.7 0.3H1c-0.55 0-1-0.45-1-1V3c0-0.55 0.45-1 1-1h3C4 0.89 4.89 0 6 0s2 0.89 2 2h3c0.55 0 1 0.45 1 1v5h-1V5H1v9h10V12zM2 4h8c0-0.55-0.45-1-1-1h-1c-0.55 0-1-0.45-1-1s-0.45-1-1-1-1 0.45-1 1-0.45 1-1 1h-1c-0.55 0-1 0.45-1 1z',
        width:  14,
        height: 16,
      },
      container: {
        css: 'octicon-container',
        path: 'M.70898438-.0009h.0136719C.30435218-.0101-.01140742.305 0 .7237v13.9395l.00976563.051c-.0066856-.033-.01866266.1507-.02148438.3926-.0014109.1209.00418368.2721.0859375.4492.08175382.1771.27270415.3512.47460937.4179l.078125.025H14.664062l.05078-.01c-.03266.01.148815.019.390625.021.120905 0 .274113 0 .451172-.084.177058-.082.351214-.2728.417968-.4746l.02539-.078V1.3362l-.0098-.051c.0067.033.01864-.1507.02149-.3925.0014-.121-.0041-.2721-.08594-.4493-.08182-.1771-.272545-.3514-.474609-.4179l-.07813-.027H.70894538zm.32031252 1.0293H14.982422c-.01553.1104-.05104.2222-.002.4629l-.0098-.1035v13.5938c-.110328-.016-.220669-.049-.460937 0l.101562-.012H1.0174971c.015522-.1103.050758-.2213.00195-.4609l.00977.1035V1.0282zm1.8515625 1.6973V13.294h1.0292968V2.7257H2.8808594zm2.3085937 0V13.294H6.21875V2.7257H5.1894531zM7.5 2.7257V13.294h1.0292969V2.7257H7.5zm2.3085938 0V13.294h1.0292972V2.7257H9.8085938zm2.3085942 0V13.294h1.029296V2.7257h-1.029296z',
        width:  16,
        height: 16,
      }
    }[name];
    if (isNaN(scale)) {
      icon.size = 1;
    } else {
      icon.size = scale;
    }
    return new Handlebars.SafeString(iconTemplate(icon));
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
    case "error":
      return 'There was an error with the deployment to ' + environment;
    case "failure":
      return 'The deployment to ' + environment + ' failed';
    default:
      return 'Waiting for deployment to ' + environment;
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
