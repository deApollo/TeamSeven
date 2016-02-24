exports.render = function(req, res) {
    res.render('index', {
    	title: 'TeamSeven',
        message: req.session.message,
        loggedin: req.session.loggedin
    });
};
