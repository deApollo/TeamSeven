exports.render = function(req, res) {
    res.render('upage', {
        message: req.session.message,
        loggedin: req.session.loggedin,
        username: req.session.username,
        title: "User Page"
    });
};
