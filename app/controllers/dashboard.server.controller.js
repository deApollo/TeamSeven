exports.render = function(req, res) {
    res.render('dashboard', {
        name : req.session.name
    });
};