exports.render = function(req, res) {
    res.render('index', {
        message : req.session.message
    });
};
