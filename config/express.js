var express = require("express");
module.exports = function() {
    var app = express();

    app.set("views", "./app/views");
    app.set("view engine", "ejs"); //Define view renderer

    var bodyParser = require("body-parser"); //Handles POST body parsing
    var session = require("express-session"); //Handles session tracking
    var MongoStore = require("connect-mongo")(session); //Helps with session tracking
    var mongoose = require("mongoose"); //Handles interacting with mongodb

    app.use(express.static("./public")); //Static resources folder
    app.use(bodyParser.urlencoded({
        extended: false
    }));
    app.use(bodyParser.json());
    app.use(session({
        secret: "We so sneaky",
        resave: false,
        saveUninitialized: true,
        store: new MongoStore({
            mongooseConnection: mongoose.connection
        })
    }));

    require("../app/routes/server.routes.js")(app);
    return app;
};
