var http = require('http');

var server = http.createServer(function (req, res) {

  // restrict the app to only take requests to /
  if(req.url !== '/') {
    res.writeHead(404, {
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify({
      error: "not found"
    }));
    return;
  }

  // restrict the app to only take POST requests
  if(req.method !== 'POST') {
    res.writeHead(405, {
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify({
      error: "method not allowed"
    }));
    return;
  }

  // Set the request body stream to utf-8 so we can read it as a string
  req.setEncoding('utf-8');

  var chunks = '';

  req.on('data', function (chunk) {
    // cat the chunks, if we have a lot of data it will be chunked and
    // we cannot rely on the payload being intact on the first data chunk
    chunks += chunk;
  });

  req.on('end', function () {
    var requestObject;

    // when the request is finished try and parse the request body as JSON
    try {
      requestObject = JSON.parse(chunks);
    } catch (e) {
      // we couldn't parse it, reply with a 400 bad request
      res.writeHead(400, {
        'Content-Type': 'application/json'
      });

      // return the error payload
      res.end(JSON.stringify({
        error: "Could not decode request:" + e.toString()
      }));

      return;
    }

    var payload = requestObject.payload;

    // filter all the shows we don't want
    payload = payload.filter(function (show) {
      return show.drm && show.episodeCount > 0;
    });

    // provide the format that we want
    payload = payload.map(function (show) {
      return {
        title: show.title,
        slug: show.slug,
        image: show.image.showImage,
      };
    });
    
    // everything went OK!
    res.writeHead(200, {
      'Content-Type': 'application/json'
    });

    // return the response payload
    res.end(JSON.stringify({response:payload}));

  });
  
});

// heroku sets $PORT to 80
server.listen(process.env.PORT, '0.0.0.0');
