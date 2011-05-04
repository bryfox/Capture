// User configuration
var outputDir     = 'out',
	contextList   = ['desktop','mobile'],
    viewportSizes = {
        desktop: { width: 1024, height: 960 },
        mobile: { width: 320, height: 460 }
    },
    UAs = {
        desktop: 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X; en-US) AppleWebKit/533.3 (KHTML, like Gecko) PhantomJS/1.0 Safari/533.3',
        mobile: 'Mozilla/5.0 (iPhone Simulator; U; CPU iPhone OS 4_0 like Mac OS X; en-us) AppleWebKit/532.9 (KHTML, like Gecko) Version/4.0.5 Mobile/8A293 Safari/6531.22.7'
    };

// Helpers
var Context = {
        all: function () { return contextList; },
        current: function () {
            var match = phantom.state.match(new RegExp("#(" + Context.all().join('|') + ")$"));
            return match ? match[1] : Context.all()[0];
        },
        previous: function () {
            var prevIndex = Context.currentIndex() - 1;
            if (prevIndex <= 0) prevIndex = Context.all().length - 1;
            return Context.all()[prevIndex];
        },
        next: function () {
            var nextIndex = Context.atLastInGroup() ? 0 : Context.currentIndex() + 1;
            return Context.all()[nextIndex];
        },
        currentIndex: function () {
            return Context.all().indexOf(Context.current());
        },
        atLastInGroup: function () {
            return Context.currentIndex() == Context.all().length - 1;
        }
    },
    Url = {
        _list: [],
        all: function () { return Url._list; },
        currentIndex: function () {
          var match = phantom.state.match(new RegExp("(.+)#(?:" + Context.all().join('|') + ")?$"));
          return match ? Url.all().indexOf(match[1]) : -1;
        },
		next: function () { return Url.all()[Url.currentIndex() + 1] || null; },
        push: function (url) { Url._list.push(url); }
    };

init();

function init () {
    var i, cookieSet = false, urls = Url.all();
    
    for (i = 0; i < phantom.args.length; i++) {
        parseArg(phantom.args[i]);
    }

    if (!urls.length) {
        console.log("Usage: phantomjs capture.js [cookie:name=value] [url] [url] ...");
        phantom.exit();
    }
    
    switch (phantom.state) {
        case '':
            if (cookieSet) {
                // FIXME
                // Cookie isn't set for the first request,
                // so add an extra request in here...
                // subsequent requests will have the cookie set.
                phantom.state = 'loadcookie';
                phantom.open(urls[0]);
            } else {
                renderAndLoad();
            }
            break;
        case 'loadcookie':
            phantom.state = urls[0] + '#desktop';
            phantom.viewportSize = { width: 1024, height: 960 };
            phantom.open(urls[0]);
            break;
        default:
            renderAndLoad();
    }
}

function parseArg (arg) {
    var match;
    if ( (match = arg.match(/^cookie:(.+)=(.+)/)) ) {
        cookieSet = true;
        document.cookie = match[1] +"=" + match[2] + "; path=/";
    } else {
        Url.push(arg);
    }
}

// The primary controller method
function renderAndLoad () {
    var urlIndex, context, url, urls;

    urlIndex = Url.currentIndex();
    context  = Context.current();
    urls     = Url.all();
    url      = urls[urlIndex];

    // Render if there's something in queue
    if (url) {
        // Allow some padding for JS to run.
        phantom.sleep(250);
		console.log("rendering " + context + " for " + url);
        phantom.render(filepath(url, context));
    }

    // Get the next URL
    if (!phantom.state || Context.atLastInGroup()) url = Url.next();

	// We might be all done
    if (!url) return phantom.exit();

	// Move to the next context
    if (phantom.state) context = Context.next();

    // Update everything for the next run & load the new URL
    phantom.state = url + '#' + context;
    phantom.viewportSize = viewportSizes[context];
    phantom.userAgent    = UAs[context];
    phantom.open(url);
}

function filepath (url, context) {
	var cleanedName = url.replace(/^http:\/\//, '').replace(/[:\/]/g, '-');
    return outputDir + '/' + cleanedName + '_' + context + '.png';
}
