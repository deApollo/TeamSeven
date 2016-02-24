var db = require('../db');

exports.getActivities = function(req, res){
    var cursor = db.get().collection('activities').find({"username" : req.session.username},{"_id" : 0});
    cursor.toArray(function(err,items){
        res.json(items);
    });
};

exports.addActivity = function(req, res) {
    var actName = req.body.activityName;
    var actDesc = req.body.activityDesc;

    var cursor = db.get().collection('activities').find({"actname" : actName, "username" : req.session.username});
    cursor.toArray(function(err,items){
        if(items.length == 0){
            db.get().collection('activities').insertOne({
                "username" : req.session.username,
                "actname" : actName,
                "actdesc" : actDesc
            });
            res.json({responseCode : 1, responseDescription: "Activity added"});
        } else {
            res.json({responseCode : 0, responseDescription: "Activity already exists"});
        }
    });
};

exports.removeActivity = function(req, res){
    var actName = req.body.activityName;
    db.get().collection('activities').deleteOne({"actname" : actName, "username" : req.session.username}, function(error, result){
        res.json({responseCode : 1, numberDeleted : result.deletedCount});
    });
};
