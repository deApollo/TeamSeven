var User = require("./../schema.js").User;
exports.render = function(req, res) {
    User.findOne({
        username: req.session.username
    }, "firstname lastname picture_uri preferred_units", function(err, obj) {
        res.render("perform", {
            name: obj.firstname + " " + obj.lastname,
            img_name: obj.picture_uri,
            page: req.url,
            units: obj.preferred_units
        });
    });
};
