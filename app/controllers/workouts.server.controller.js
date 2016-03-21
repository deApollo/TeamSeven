exports.render = function(req, res) {
    res.render('exercises', {
        name : req.session.name
    });
};
