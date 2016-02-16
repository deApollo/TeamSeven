var serverPort = 1337;
var mongoPort = 27017;
var dbname = mydatabase;
var express = require('./config/express');
var app = express();
var db = require('./db');

db.connect('mongodb://localhost:' + mongoPort + '/' + dbname, function(err) {
  if (err) {
    console.log('Unable to connect to Mongo.')
    process.exit(1)
  } else {
    app.listen(port, function() {
      console.log('Listening on port 3000...')
    })
  }
})

module.exports = app;
console.log('Server running at http://localhost:' + port);