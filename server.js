#! /usr/bin/node

var net = require('net');
var sqlite3 = require("sqlite3");
var argv = require("./argvparser");
var logger = require("./logger");
var connector = require("./connector");
var listener = require("./listener");
var express = require('express');
var kml = require('./kml');

var dbname = 'agpsd.db';
if (argv.options.db && argv.options.db.length > 0) {
  dbname = argv.options.db[0];
}
exports.serverSockets = {};
exports.db = new sqlite3.Database(dbname);
kml.db = exports.db;
logger.init(
  exports.db,
  function (err) {
    var server = net.createServer(function (socket) {
      socket.name = socket.remoteAddress + ":" + socket.remotePort
      new listener.Listener(socket);
    })
    var port = 4711;
    if (argv.options.listen && argv.options.listen.length > 0) {
      port = argv.options.listen[0];
    }
    server.listen(port);

    if (argv.options.upstream) {
      argv.options.upstream.forEach(function (val, index) {
        val = val.split(":");
        new connector.Connector(val[0], val[1], false);
      });
    }

    if (argv.options.downstream) {
      argv.options.downstream.forEach(function (val, index) {
        val = val.split(":");
        new connector.Connector(val[0], val[1], true);
      });
    }

    webserver = express.createServer();
    webserver.use(function (req, res, next) {
      res.header("Server", "AGPSD");
      next();
    });
    webserver.get('/kml', kml.getKml);
    var httpport = 4812;
    if (argv.options.httplisten && argv.options.httplisten.length > 0) {
      httpport = argv.options.httplisten[0];
    }
    webserver.listen(httpport);


    console.log("Listening for web requests on " + httpport);
    console.log("Listening for connections on " + port);



  }
);
