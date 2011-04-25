var i,
	// Context = {
	//         all: function () { return ['desktop','mobile']; }
	//         current: null,
	//         next: function () {
	//             var contexts = Context.all(),
	//                 c = Context.current || contexts[0],
	//                 i = contexts.indexOf(c);
	//             Context.current = 
	//             return contexts[(i == contexts.length + 1) ? 0 : i + 1];
	//         }
	//     },
    // contexts = Context.all,
    contexts = ['desktop','mobile'],
    viewportSizes = {
        desktop: { width: 1024, height: 960 },
        mobile: { width: 320, height: 460 }
    },
    UAs = {
        desktop: 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X; en-US) AppleWebKit/533.3 (KHTML, like Gecko) PhantomJS/1.0 Safari/533.3',
        mobile: 'Mozilla/5.0 (iPhone Simulator; U; CPU iPhone OS 4_0 like Mac OS X; en-us) AppleWebKit/532.9 (KHTML, like Gecko) Version/4.0.5 Mobile/8A293 Safari/6531.22.7'
    },
    cookieSet = false,
    urls = [];

for (i = 0; i < phantom.args.length; i++) {
    parseArg(phantom.args[i]);
}

if (!urls.length) {
    console.log("Usage: phantomjs ua.js [cookie:name=value] [url] [url] ...");
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


function parseArg (arg) {
    var match;
    if ( (match = arg.match(/^cookie:(.+)=(.+)/)) ) {
        cookieSet = true;
        document.cookie = match[1] +"=" + match[2] + "; path=/";
    } else {
        urls.push(arg);
    }
}

function renderAndLoad () {
console.log('renderAndLoad ' + phantom.state);

    var match, urlIndex, context, url;

    match    = phantom.state.match(/(.+)#(desktop|mobile)$/);
    urlIndex = match ? urls.indexOf(match[1]) : -1;
    context  = match ? match[2] : contexts[0];
    url      = urls[urlIndex];

    // Render if there's something in queue
    if (urlIndex > -1 || context == 'mobile') {
		// Allow some padding for JS to run.
		phantom.sleep(250);
		phantom.render('out/' + clean(url) + '_' + context + '.png');
	}

    // Get the next URL
    if (!phantom.state || context == 'mobile') {
        urlIndex +=1;
        url = urls[urlIndex];
    }

    context = context == 'mobile' ? 'desktop' : 'mobile';

    if (!url) phantom.exit();
    phantom.state = url + '#' + context;
    phantom.viewportSize = viewportSizes[context];
    phantom.userAgent    = UAs[context];
    console.log('opening ' + url);
    phantom.open(url);
}

function clean (url) {
    return url.replace(/^http:\/\//, '').replace(/[:\/]/g, '-');
}