var User = require("./../schema.js").User;

exports.render = function(req, res) {
    User.findOne({username : req.session.username }, "firstname lastname preferred_units email picture_uri",function(err,obj){
        res.render("preferences", {
            name : obj.firstname + " " + obj.lastname,
            firstname : obj.firstname,
            lastname : obj.lastname,
            preferred_units : obj.preferred_units,
            email : obj.email,
            username : req.session.username,
            img_name : obj.picture_uri
        });
    });
};
