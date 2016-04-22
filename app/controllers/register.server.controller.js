exports.render = function(req, res) {
    var msgLocal = req.session.message;
    req.session.message = "";
    res.render("register", {
        message : msgLocal
    });
};
