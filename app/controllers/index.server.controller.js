exports.render = function(req, res) {
    if(req.session.loggedin) {
        res.redirect("/dashboard");
    } else {
        var msgLocal = req.session.message;
        req.session.message = "";
        res.render("index", {
            message : msgLocal
        });
    }
};
