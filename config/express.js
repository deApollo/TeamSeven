var express = require("express");
module.exports = function() {
    var app = express();

    app.set("views", "../app/views");
    app.set("view engine", "ejs");

    var bodyParser = require("body-parser");
    var session = require("express-session");
    var MongoStore = require("connect-mongo")(session);
    var mongoose = require("mongoose");

    app.use(express.static("../public"));
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

    require("../app/routes/index.server.routes.js")(app);
    return app;
};
