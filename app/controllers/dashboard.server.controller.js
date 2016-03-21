var User = require('./../schema.js').User;
exports.render = function(req, res) {
    User.findOne({username : req.session.username }, 'picture_uri',function(err,obj){
        res.render('dashboard', {
            name : req.session.name,
            username : req.session.username,
            img_name : obj.picture_uri
        });
    });
};
