var serverPort = 1337;
var mongoPort = 27017;
var dbname = 'teamseven';
var express = require('../config/express');
var app = express();
var db = require('./db');

db.connect('mongodb://localhost:' + mongoPort + '/' + dbname, function(err) {
  if (err) {
    console.log('Unable to connect to Mongo.');
    process.exit(1);
  } else {
    app.listen(serverPort, function() {
      console.log('Listening on port ' + serverPort);
    });
  }
});

module.exports = app;
