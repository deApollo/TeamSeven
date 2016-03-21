var mongoose = require('mongoose');
var User = require('./../schema.js').User;
var passwordHash = require('password-hash');
var fs = require('fs');

exports.register = function(req, res) {
    var fname = req.body.fname;
    var lname = req.body.lname;
    var user = req.body.username;
    var pword = req.body.password;
    var uemail = req.body.email
    var upreferred_units = req.body.units
    User.find({username : user}, function(err, docs){
        if(docs.length){
            req.session.loggedin = false;
            req.session.message = "A user with username: " + user + " already exists!";
            res.redirect("/");
        } else {
            var pwordHash = passwordHash.generate(pword);
            User.create({firstname : fname, lastname : lname, username : user, password : pwordHash, email : uemail, preferred_units : upreferred_units}, function(err, obj){
                if(err){
                    req.session.loggedin = false;
                    req.session.message = "A problem occured creating your account, " + err;
                    fs.unlinkSync('./../public/images/userimages' + username + '.jpg');
                    res.redirect("/");
                } else {
                    console.log("Added user " + user + " with password " + pword + " hashed as "  + pwordHash);
                    req.session.loggedin = true;
                    req.session.username = user;
                    req.session.message = "Successfully registered user: " + user;
                    req.session.name = fname + ' ' + lname;
                    res.redirect("/dashboard");
                }
            });
        }
    });
};

exports.login = function(req, res) {
    var user = req.body.username;
    var pword = req.body.password;
    console.log("Attempting to find user " + user + " with password " + pword)
    User.findOne({username : user} , 'firstname lastname password', function(err, person){
        if(err){
            req.session.loggedin = false;
            req.session.message = "Invalid username or password!";
            res.redirect("/");
        } else if(person != null){
            if(passwordHash.verify(pword,person.password)){
                req.session.loggedin = true;
                req.session.username = user;
                req.session.name = person.firstname + ' ' + person.lastname;
                req.session.message = "Welcome " + person.firstname + ", you have been logged in!";
                res.redirect("/dashboard");
            } else {
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
    req.session.loggedin = false;
    req.session.message = "You have been logged out!";
    res.redirect("/");
};

exports.validate = function(req,res,next){
    if(req.session.loggedin){
        console.log("Login validated for user: " + req.session.username);
        next();
    } else {
        console.log("Login validation failed!");
        res.redirect("/");
    }
};
