var User = require("./../schema.js").User;
exports.render = function(req, res) {
    User.findOne({username : req.session.username }, "firstname lastname picture_uri",function(err,obj){
        res.render("workouts", {
            name : obj.firstname + " " + obj.lastname,
            username : req.session.username,
            img_name : obj.picture_uri,
            page : req.url
        });
    });
};
