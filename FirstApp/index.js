/*
 *
 * Primary file for API
 *
 */

// Import dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');

// we are instantiating the http server
const httpServer = http.createServer(function(req, res) {
  unifiedServer(req, res);
});

// Start the server
httpServer.listen(config.httpPort, function() {
  console.log(`The server has started on port ${config.httpPort}`);
});


// ==================== HTTPS ===============

const httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};

// we are instantiating the https server
const httpsServer = https.createServer(httpsServerOptions, function(req, res) {
  unifiedServer(req, res);
});

// Start the http server
httpsServer.listen(config.httpsPort, function() {
  console.log(`The server has started on port ${config.httpsPort}`);
});


//================= UNIFIED SERVER ===================//
// All the serverlogic for http and https server
const unifiedServer = function(req, res) {
  //  get the url and parse it
  const parsedURL = url.parse(req.url, true);

  // Get the path from URL
  const path = parsedURL.pathname; //this is a untrimmed path
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query sting as an object
  const queryStringObject = parsedURL.query;

  //Get the HTTP method
  const method = req.method.toLowerCase();

  // Get the header as an object
  const header = req.headers;

  // Get the payload if there is any
  /* It is for streaming datas
   * Paylaod which comes as http request, come in to the http server,as a stream
   * and when streamtells us we are at the end, combine that into one sigle string,
   * before we can figure out what that payload is..
   * Because as we receive little bits of the payload, we want to know the information
   * in its entirity.
   */

  // For this we need another NODE buil in library --> stringDecoder
  const decoder = new StringDecoder('utf-8');

  // So we create newstring to hold the bits of payload
  var buffer = '';
  // We then, append all the bits to buffer to create whole string

  req.on('data', function(data) {
    buffer += decoder.write(data);
  });

  // There is another method which lets us know the data haas completely received
  req.on('end', function() {
    // This function will always run regardless of payload or no-payload
    buffer += decoder.end();

    // construnct data object to send it to the handler
    const data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': header,
      'payload': buffer
    };

    //Here we will choose the handler this request should go to, if one is not found,
    // use the pageNot found handler
    var chosenHandler = typeof(router[data.trimmedPath]) !== 'undefined' ? router[data.trimmedPath] : handlers.notFound

    // route the request to the handler specified in the router
    chosenHandler(data, function(statusCode, payload) {
      // use the status code called back by the handler, or default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
      // use the payload called back by the handler, or default to an empty object
      payload = typeof(payload) == 'object' ? payload : {};

      // We cannot send an object back down to the user who send this request
      // convert the payload to the sting
      const payloadString = JSON.stringify(payload); //This is the payload that handler sending back to the user

      // return the response
      res.setHeader('content-type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
      console.log('Returning this response : ', statusCode, payloadString);

    });
  });

  // Send the response
  // res.end('Hello this is server!!\n');

  // Log the path person is asking for
  // console.log(`The request is received on path: ${trimmedPath} with method ${method} with these query string parameters`, queryStringObject);
  // });

  // console.log('request recived with headers : ', header);
};


// Define handlers
var handlers = {};

// // sample handler
// handlers.sample = function(data, callback) {
//   // callback a http status code (406), {and a payload object}
//   callback(406, {
//     'name': 'My name is sample handler'
//   });
// };

// Ping handler
handlers.ping = function(data, callback) {
  // callback a http status code (406), {and a payload object}
  callback(200);
};

// Page not found handler
handlers.notFound = function(data, callback) {
  callback(404);
};


// Here we are defining a request router
var router = {
  'ping': handlers.ping
};
