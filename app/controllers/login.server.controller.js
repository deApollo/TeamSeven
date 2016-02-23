var db = require('../db');
var passwordHash = require('password-hash');

exports.register = function(req, res, next) {
    var user = req.body.username;
    var pword = req.body.password;
    db.get().collection('users').find( { "username" : user } ).count(function(err, count){
        if(count == 0){
            var pwordHash = passwordHash.generate(pword);
            db.get().collection('users').insertOne({"username" : user, "password" : pwordHash});
            req.session.loggedin = true;
            req.session.message = "Successfully registered user: " + user;
        }
        else {
            req.session.loggedin = false;
            req.session.message = "A user with username: " + user + " already exists!";
        }
        next();
    });
};

exports.login = function(req, res, next) {
    var user = req.body.username;
    var pword = req.body.password;
    var cursor = db.get().collection('users').find( { "username" : user } );
    cursor.toArray(function(err,items){
        if(items.length == 1){
            var pwordHash = items[0]["password"];
            if(passwordHash.verify(pword,pwordHash)){
                req.session.loggedin = true;
                req.session.message = "Welcome " + user + ", you have been logged in!";
            }else{
                req.session.loggedin = false;
                req.session.message = "Invalid username or password!";
            }
        } else {
            req.session.loggedin = false;
            req.session.message = "Invalid username or password!";
        }
        next();
    });
};

exports.logout = function(req, res, next){
    if(req.session.loggedin = true){
        req.session.loggedin = false;
        req.session.message = "You have been logged out!";
    } else {
        req.session.message = "You aren't even logged in!";
    }
    next();
};
