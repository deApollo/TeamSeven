var db = require('../db');
var passwordHash = require('password-hash');

exports.register = function(req, res) {
    var user = req.body.username;
    var pword = req.body.password;
    db.get().collection('users').find( { "username" : user } ).count(function(err, count){
        if(count == 0){
            var pwordHash = passwordHash.generate(pword);
            db.get().collection('users').insertOne({"username" : user, "password" : pwordHash});
            req.session.loggedin = true;
            req.session.username = user;
            req.session.message = "Successfully registered user: " + user;
            res.redirect("/upage");
        }
        else {
            req.session.loggedin = false;
            req.session.message = "A user with username: " + user + " already exists!";
            res.redirect("/");
        }
    });
};

exports.login = function(req, res) {
    var user = req.body.username;
    var pword = req.body.password;
    var cursor = db.get().collection('users').find( { "username" : user } );
    cursor.toArray(function(err,items){
        if(items.length == 1){
            var pwordHash = items[0]["password"];
            if(passwordHash.verify(pword,pwordHash)){
                req.session.loggedin = true;
                req.session.username = user;
                req.session.message = "Welcome " + user + ", you have been logged in!";
                res.redirect("/upage");
            }else{
                req.session.loggedin = false;
                req.session.message = "Invalid username or password!";
                res.redirect("/");
            }
        } else {
            req.session.loggedin = false;
            req.session.message = "Invalid username or password!";
            res.redirect("/");
        }
    });
};

exports.logout = function(req, res){
    if(req.session.loggedin = true){
        req.session.username = "";
        req.session.loggedin = false;
        req.session.message = "You have been logged out!";
    } else {
        req.session.message = "You aren't even logged in!";
    }
    res.redirect("/");
};

exports.validate = function(req,res,next){
    if(req.session.loggedin){
        next();
    } else {
        res.redirect("/");
    }
};
