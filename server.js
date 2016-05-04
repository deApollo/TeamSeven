var serverPort = 1337;
var express = require("./config/express");
var app = express();
var db = require("./app/db");

app.listen(serverPort, function() {
  console.log("Listening on port " + serverPort);
});

module.exports = app;
