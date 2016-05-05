var User = require("./../schema.js").User;
var passwordHash = require("password-hash");

/**
 * Function that validates the form input for the registration form.
 * Sets the appropriate error message in the users session if something is invalid
 *
 * @param {object} req
 *   The express HTTP request containing the information require for the function
 */
function validateInputs(req){
    if(!req.body.username || req.body.username == ""){
        req.session.message = "Please enter a valid username";
        return false;
    }
    if(!req.body.password || req.body.password == ""){
        req.session.message = "Please enter a valid password";
        return false;
    }
    if(!req.body.fname || req.body.fname == ""){
        req.session.message = "Please enter a valid first name";
        return false;
    }
    if(!req.body.lname || req.body.lname == ""){
        req.session.message = "Please enter a valid last name";
        return false;
    }
    var email_pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var email_valid = email_pattern.test(req.body.email);
    if(!email_valid){
        req.session.message = "Please enter a valid email address";
        return false;
    }
    if(!req.body.units){
        req.session.message = "Please select your units";
    }
    return true;
}

/**
 * Backend endpoint for registering a user
 *
 * @param {object} req
 *   The express HTTP request containing the information require for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.register = function(req, res) {
    var fname = req.body.fname;
    var lname = req.body.lname;
    var user = req.body.username;
    var pword = req.body.password;
    var uemail = req.body.email;
    var upreferred_units = req.body.units;
    if(!validateInputs(req)){
        res.redirect("/register");
        return;
    }
    User.find({username : user}, function(err, docs){
        if(docs.length){
            req.session.loggedin = false;
            req.session.message = "A user with username: " + user + " already exists!";
            res.redirect("/register");
        } else {
            var pwordHash = passwordHash.generate(pword);
            var image_URI = "./../default";
            User.create({firstname : fname, lastname : lname, username : user, password : pwordHash, email : uemail, preferred_units : upreferred_units, picture_uri : image_URI}, function(err){
                if(err){
                    req.session.loggedin = false;
                    res.redirect("/register");
                } else {
                    console.log("Added user " + user + " with password " + pword + " hashed as "  + pwordHash);
                    req.session.loggedin = true;
                    req.session.username = user;
                    res.redirect("/dashboard");
                }
            });
        }
    });
};

/**
 * Backend endpoint for logging a user in
 *
 * @param {object} req
 *   The express HTTP request containing the information require for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.login = function(req, res) {
    var user = req.body.username;
    var pword = req.body.password;
    console.log("Attempting to find user " + user + " with password " + pword);
    User.findOne({username : user} , "firstname lastname password", function(err, person){
        if(err){
            req.session.loggedin = false;
            req.session.message = "An error occured logging you in";
            res.redirect("/");
        } else if(person != null){
            if(passwordHash.verify(pword,person.password)){
                req.session.loggedin = true;
                req.session.username = user;
                req.session.message = "You have been successfully logged in!";
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

/**
 * Backend endpoint for changing a users password
 *
 * @param {object} req
 *   The express HTTP request containing the information require for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.changepassword = function(req, res) {
    var user = req.session.username;
    var oldpword = req.body.oldpword;
    var pword = req.body.pword;
    var pwordverif = req.body.pwordverif;
    if(pword != pwordverif) {
        req.session.message = "New passwords do not match!";
        res.redirect("/changepassword");
    }
    console.log("Attempting to change password for user " + user + " with password " + pword);
    User.findOne({username : user} , "password", function(err, person){
        if(err){
            req.session.message = "An error occured changing your password";
            res.redirect("/changepassword");
        } else if(person != null){
            if(passwordHash.verify(oldpword, person.password)){
                var pwordHash = passwordHash.generate(pword);
                User.update({username : user}, {password : pwordHash}, {}, function(err2){
                    if(err2){
                        req.session.message = "An error occured changing your password";
                        res.redirect("/changepassword");
                    } else {
                        req.session.message = "Password changed successfully!";
                        res.redirect("/changepassword");
                    }
                });
            } else {
                req.session.message = "Invalid current password!";
                res.redirect("/changepassword");
            }
        } else {
            req.session.message = "Invalid current password!";
            res.redirect("/changepassword");
        }
    });
};

/**
 * Backend endpoint for logging a user out
 *
 * @param {object} req
 *   The express HTTP request containing the information require for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.logout = function(req, res){
    req.session.loggedin = false;
    req.session.message = "You have been logged out!";
    req.session.destroy();
    res.redirect("/");
};

/**
 * Backend endpoint for validating a users session
 *
 * @param {object} req
 *   The express HTTP request containing the information require for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.validate = function(req,res,next){
    if(req.session.loggedin){
        next();
    } else {
        res.redirect("/");
    }
};

/**
 * Function which redirects a user to the dashboard from the index if they are
 * already logged in.
 *
 * @param {object} req
 *   The express HTTP request containing the information require for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.indexRedir = function(req,res,next){
    if(req.session.loggedin){
        if(req.session.loggedin == true)
            res.redirect("/dashboard");
    } else {
        next();
    }
};
