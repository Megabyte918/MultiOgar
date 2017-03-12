"use strict";

//-------------------- auth -----------------
  /**
  * RegExp for basic auth credentials
  *
  * credentials = auth-scheme 1*SP token68
  * auth-scheme = "Basic" ; case insensitive
  * token68     = 1*( ALPHA / DIGIT / "-" / "." / "_" / "~" / "+" / "/" ) *"="
  * @private
  */

  var CREDENTIALS_REGEXP = /^ *(?:[Bb][Aa][Ss][Ii][Cc]) +([A-Za-z0-9._~+/-]+=*) *$/;

  /**
   * RegExp for basic auth user/pass
   *
   * user-pass   = userid ":" password
   * userid      = *<TEXT excluding ":">
   * password    = *TEXT
   * @private
   */

  var USER_PASS_REGEXP = /^([^:]*):(.*)$/;

  /**
   * Parse the Authorization header field of a request.
   *
   * @param {object} req
   * @return {object} with .name and .pass
   * @public
   */

  function auth (req) {
    if (!req) {
      throw new TypeError('argument req is required');
    }

    if (typeof req !== 'object') {
      throw new TypeError('argument req is required to be an object');
    }

    // get header
    var header = getAuthorization(req.req || req);

    // parse header
    return parse(header);
  }

  /**
   * Decode base64 string.
   * @private
   */

  function decodeBase64 (str) {
    return new Buffer(str, 'base64').toString();
  }

  /**
   * Get the Authorization header from request object.
   * @private
   */

  function getAuthorization (req) {
    if (!req.headers || typeof req.headers !== 'object') {
      throw new TypeError('argument req is required to have headers property');
    }

    return req.headers.authorization;
  }

  /**
   * Parse basic auth to object.
   *
   * @param {string} string
   * @return {object}
   * @public
   */

  function parse (string) {
    if (typeof string !== 'string') {
      return undefined;
    }

    // parse header
    var match = CREDENTIALS_REGEXP.exec(string);

    if (!match) {
      return undefined;
    }

    // decode user pass
    var userPass = USER_PASS_REGEXP.exec(decodeBase64(match[1]));

    if (!userPass) {
      return undefined;
    }

    // return credentials object
    return new Credentials(userPass[1], userPass[2]);
  }

  /**
   * Object to represent user credentials.
   * @private
   */

  function Credentials (name, pass) {
    this.name = name;
    this.pass = pass;
  }

//******************** server ***************
  
  var http = require('http');
  var fs = require('fs');
  var consoleServer = http.createServer(function (request, response) {
      //  console.log('request starting...');  
      var credentials = auth(request);
      if (!credentials || credentials.name !== 'admin' || credentials.pass !== 'pass') 
      {
              response.statusCode = 401;
              response.setHeader('WWW-Authenticate', 'Basic realm="example"');
              response.end('Access denied');
      } else 
      {
        fs.readFile('./console-plus.html', function(error, content) {
          if (error) {
            response.writeHead(500);
            response.end();
          }
          else {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(content, 'utf-8');
          }
        }); 
      } 

  }).listen(1234, function() {
        console.log(/*(new Date()) + */' consoleServer is listening on port 1234');  
     });

//============== interseption ===============

  var child = require('child_process');
  var MO = child.spawn('node',['../src/index.js']);

//  process.stdin.pipe(MO.stdin); // loopback IN

  MO.stdin.on("end", function() {
      process.exit(0);
  });

  MO.stdout.on('data', function (data) { // send data to remote console
//       console.log((data+"").trim()); // loopback OUT
       for (var i in clients) {
          if (clients.hasOwnProperty(i)) {     
              clients[i].send((data+"").trim());
          }
       }
  });

  MO.stderr.on('data', function (data) {
       console.log('stderr: ' + data); // should be directed to logger 
  });

//+++++++++++++++++ sockets +++++++++++++++++

  var count = 0;
  var clients = {};

  var wsOptions = {
        server: consoleServer, 
        perMessageDeflate: false,
        maxPayload: 4096,
        protocolVersion: 8,
        origin:'http://127.0.0.1:1234',
        autoAcceptConnections: false
    };

  var WebSocketServer = require('ws').Server;
  var wsServer = new WebSocketServer(wsOptions);

  wsServer.on('connection', function(ws) {

      // Code here to run on connection
      var hst = ws.upgradeReq.headers.host;
      var org = ws.upgradeReq.headers.origin.replace(/^https?:\/\//,'');
      // console.log('host '+ hst+' origin '+ org);

      if(hst !== org) {
        console.log(/*(new Date()) +*/' Connection [' + id + '] '+ hst+' / '+ org + ' REJECTED');
        return ws.close();
      }

      // Specific id for this client & increment count
      var id = count++; // = ws.clients.length

      // Store the connection method so we can loop through & contact all clients
      clients[id] = ws;
      
      console.log(/*(new Date()) +*/' Connection [' + id + '] '+ hst+' / '+ org + ' ACCEPTED');


      // Create event listener
      ws.on('message', function(message) {
          // get line from remote
          MO.stdin.write(message.replace("<br>","")+"\n"); 
          for (var i in clients) { 
            if (clients.hasOwnProperty(i)) {   
              clients[i].send((message+"").trim());
            }  
          }
      });

      ws.on('close', function(reasonCode, description) {
        delete clients[id];
        console.log(/*(new Date()) + */' Peer ['+id+'] ' + ws.upgradeReq.headers.host + ' disconnected.');
      });
  });
