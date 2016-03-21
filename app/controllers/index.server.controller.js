exports.render = function(req, res) {
    if(req.session.loggedin) {
        res.redirect('/dashboard');
    } else {
        res.render('index', {
            message : req.session.message
        });
    }
};
