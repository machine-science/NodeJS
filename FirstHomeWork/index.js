/*
 * FILE FOR API
 */

const http = require('http');
const url = require('url');

const httpServer = http.createServer((req, res) => {

  // Get url
  const parsedURL = url.parse(req.url, true);

  // Get the path from URL
  const path = parsedURL.pathname;

  // To get the trimmed path
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query sting as an object
  const queryStringObject = parsedURL.query;

  // Get the http method
  const method = req.method.toLowerCase();

  // Get the header as an object
  const header = req.headers;

  // construnct data object to send it to the handler
  const data = {
    'trimmedPath': trimmedPath,
    'method': method,
    'headers': header
  };

  //Here we will choose the handler this request should go to, if one is not found,
  // use the pageNot found handler
  const chosenHandler = typeof(router[data.trimmedPath]) !== 'undefined' ? router[data.trimmedPath] : handlers.notFound

  // Route the request to the route specified in the url
  chosenHandler(data, (statusCode, payload) => {
    // use the status code called back by the handler, or default to 200
    statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
    // use the payload called back by the handler, or default to an empty object
    payload = typeof(payload) == 'object' ? payload : {};

    // Converting payload object to sting
    const payloadString = JSON.stringify(payload);

    // return the response

    res.setHeader('content-type', 'application-json');
    res.writeHead(statusCode);
    res.end(payloadString);
    console.log('Returning this response: ', statusCode, payloadString);

  });

});

// Start the http server
httpServer.listen(3000,() => {
  console.log(`The server has started on port 3000`);
});

const handlers = {};

handlers.hello = (data, callback) => {
  callback(406, {'Message' : 'Hello Pirple!!'});
};

handlers.notFound = (data, callback) => {
  callback(404);
};

// Defining the request route

const router = {
  'hello' : handlers.hello
};
