// User configuration
var outputDir = 'out',
    deviceContexts = {
      'desktop': {
        'viewport': { width: 1024, height: 960 },
        'userAgent': 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X; en-US) AppleWebKit/533.3 (KHTML, like Gecko) PhantomJS/1.0 Safari/533.3'
      },
      'iphone': {
        'viewport': { width: 320, height: 460 },
        'userAgent': 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_0 like Mac OS X; en-us) AppleWebKit/532.9 (KHTML, like Gecko) Version/4.0.5 Mobile/8A293 Safari/6531.22.7'
      },
      'ipad': {
        'viewport': { width: 768, height: 1004 },
        'userAgent': 'Mozilla/5.0(iPad; U; CPU OS 4_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8F191 Safari/6533.18.5'
      }
    };

function Capture (deviceContexts, outputDir) {
  outputDir = outputDir || 'out';

  var renderQueueLength = 0,
      renderCompleteCount = 0,
      urls = [],
      opts = {};

  init();

  function init () {
    var i, len, j = -1;

    for (i = 0; i < phantom.args.length; i++)
      parseArg(phantom.args[i]);

    for (i = 0, len = urls.length; i < len; i++) {
      for (context in deviceContexts) {
        renderQueueLength++;
        loadAndRender(urls[i], context);
      }
    }
  }

  function onRenderDone (name) {
    console.error('Saved ' + name);
    if (++renderCompleteCount == renderQueueLength)
      phantom.exit();
  }

  function loadAndRender (url, contextName) {
    var page = new WebPage(),
        context = deviceContexts[contextName];

    page.settings.userAgent = context.userAgent;
    page.clipRect = page.viewportSize = context.viewport;
    page.clipRect.top = 0;
    page.clipRect.left = 0;

    if (opts.logging)
      page.onConsoleMessage = function (msg) { console.log(msg); };

    page.open(url, function (status) {
      output = filepath(url, contextName);
      if (status == 'success') {
        (function (output) {
          setTimeout(function () {
            page.render(output);
            onRenderDone(output);
          }, 500);
        }(output));
      } else {
        console.error('Error saving ' + output);
      }
    });
  }

  function filepath (url, context) {
    var cleanedName = url.replace(/^http:\/\//, '').replace(/[:\/]/g, '-');
    return outputDir + '/' + cleanedName + '_' + context + '.png';
  }

  function parseArg (arg) {
      var match;
      if ( (match = arg.match(/^--capture:(.+)=(.+)/)) ) {
          opts[match[1]] = match[2];
      } else if (arg.indexOf('--') != 0) {
          urls.push(arg);
      }
  }

}

new Capture(deviceContexts);