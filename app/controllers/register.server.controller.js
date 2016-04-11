exports.render = function(req, res) {
    res.render('register', {
        message : req.session.message
    });
};
