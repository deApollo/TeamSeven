var mongoose = require('mongoose');
var passwordHash = require('password-hash');

exports.register = function(req, res) {
    var fname = req.body.fname;
    var lname = req.body.lname;
    var user = req.body.username;
    var pword = req.body.password;
    User.find({username : user}, function(err, docs){
        if(docs.length){
            req.session.loggedin = false;
            req.session.message = "A user with username: " + user + " already exists!";
            res.redirect("/");
        } else {
            var pwordHash = passwordHash.generate(pword);
            User.create({firstname : fname, lastname : lname, username : user, password : pword}, function(err, obj){
                if(err){
                    req.session.loggedin = false;
                    req.session.message = "A problem occured creating your account, " + err;
                    res.redirect("/");
                } else {
                    req.session.loggedin = true;
                    req.session.username = user;
                    req.session.message = "Successfully registered user: " + user;
                    res.redirect("/upage");
                }
            });
        }
    });
};

exports.login = function(req, res) {
    var user = req.body.username;
    var pword = req.body.password;
    User.findOne({username : user} , 'firstname password', function(err, person){
        if(err){
            req.session.loggedin = false;
            req.session.message = "Invalid username or password!";
            res.redirect("/");
        } else {
            if(passwordHash.verify(person.password,pword)){
                req.session.loggedin = true;
                req.session.username = user;
                req.session.message = "Welcome " + person.firstname + ", you have been logged in!";
                res.redirect("/upage");
            } else {
                req.session.loggedin = false;
                req.session.message = "Invalid username or password!";
                res.redirect("/");
            }
        }
    });
};

exports.logout = function(req, res){
    req.session.loggedin = false;
    req.session.message = "You have been logged out!";
    res.redirect("/");
};

exports.validate = function(req,res,next){
    if(req.session.loggedin){
        next();
    } else {
        res.redirect("/");
    }
};
