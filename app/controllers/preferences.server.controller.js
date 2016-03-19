mongoose = require('mongoose');

exports.render = function(req, res) {
    User.findOne({username : req.session.username }, 'firstname lastname profile_url preferred_units email',function(err,obj){
        res.render('preferences', {
        	firstname : obj.firstname,
            lastname : obj.lastname,
            profile_url : obj.profile_url,
            preferred_units : obj.preferred_units,
            email : obj.email
        });
    });
};
