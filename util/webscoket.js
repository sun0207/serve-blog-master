const WebSocketServer = require('websocket').server;
const http = require('http');
const https = require('https');
const fs = require('fs');
const consola = require('consola');
//const options = {
//    key:fs.readFileSync(__dirname+'/Nginx/xxx.key'),
//   cert:fs.readFileSync(__dirname+'/Nginx/xxx.crt'),
//}
//const server = https.createServer(options,function(request, response) {
//    response.writeHead(404);
//    response.end();
//});
var server = http.createServer(function(request, response) {
    response.writeHead(404);
    response.end();
});
server.listen(3355, function() {
    consola.success('\u001b[32m webscoket服务已建立;端口号:3355 \u001b[0m');
});
 
const wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});
module.exports = wsServer;