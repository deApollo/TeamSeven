var mongoose = require('mongoose');
var User = require('./../schema.js').User;
var Exercise = require('./../schema.js').Exercise;
var Workout = require('./../schema.js').Workout;
var Performance = require('./../schema.js').Performance;

exports.changeUserPicture = function(req,res){
    User.update({username : req.session.username}, { $set: {picture_uri : req.session.username}},function(err, obj){
        if(err) {
            res.json({
                responseCode: 0,
                data: err
            });
        } else {
            res.json({
                responseCode: 1,
                data: obj
            });
        }
    });
}

exports.getUserPreferences = function(req, res){
    User.findOne({username : req.session.username}, 'firstname lastname profile_url preferred_units email', function(err, obj){
        if(err) {
            res.json({
                responseCode: 0,
                data: err
            });
        } else {
            res.json({
                responseCode: 1,
                data: obj
            });
        }
    });
}

exports.changeUserPreference = function(req, res){
    var field = req.body.field;
    var value = req.body.value;
    var update = {};
    update[field] =  value;
    console.log("Changing user preference " + field + " to " + value);
    User.update({username : req.session.username}, { $set: update},function(err, obj){
        if(err) {
            res.json({
                responseCode: 0,
                data: err
            });
        } else {
            res.json({
                responseCode: 1,
                data: obj
            });
        }
    });
}

exports.getExercises = function(req, res) {
    console.log("Getting list of exercises for user: " + req.session.username);
    Exercise.find({
        username: req.session.username
    }, function(err, obj) {
        if (err) {
            res.json({
                responseCode: 0,
                data: err
            });
        } else {
            res.json({
                responseCode: 1,
                data: obj
            });
        }
    });
};

exports.addExercise = function(req, res) {
    var exName = req.body.exerciseName;
    var exDesc = req.body.exerciseDesc;
    var exType = req.body.exerciseType;
    console.log("Attempting to add exercise with name: " + exName + " and data: " + exDesc);
    Exercise.create({
        username: req.session.username,
        exercisename: exName,
        exercisedesc: exDesc,
        exercisetype : exType
    }, function(err, obj) {
        if (err) {
            res.json({
                responseCode: 0,
                error: err
            });
        } else {
            res.json({
                responseCode: 1,
                id: obj._id
            });
        }
    });
};

exports.removeExercise = function(req, res) {
    var eID = req.body.id;
    console.log("Attempting to remove an exercise with id: " + eID);
    Exercise.remove({
        username: req.session.username,
        _id: mongoose.Types.ObjectId(eID)
    }, function(err) {
        if (err) {
            res.json({
                responseCode: 0,
                error: err
            });
        } else {
            res.json({
                responseCode: 1
            });
        }
    });
}

exports.updateExercise = function(req, res) {
    var eID = req.body.id;
    var exName = req.body.exerciseName;
    var exDesc = JSON.stringify(req.body.exerciseDesc);
    console.log("Attempting to update exercise with name: " + exName + " and data: " + exDesc);
    Exercise.update({ _id: mongoose.Types.ObjectId(eID) },
        { exercisename: exName, exercisedesc: exDesc},
        {},
        function (err, raw) {
            if (err) {
                res.json({
                    responseCode: 0,
                    error: err
                });
            } else {
                res.json({
                    responseCode: 1
                });
            }
        }
    );
};

exports.getWorkouts = function(req, res) {
    console.log("Attempting to get list of workouts for user: " + req.session.username);
    Workout.find({ username: req.session.username })
    .populate('exercises')
    .exec(function(err, obj) {
        if (err) {
            res.json({
                responseCode: 0,
                data: err
            });
        } else {
            res.json({
                responseCode: 1,
                data: obj
            });
        }
    });
};

exports.getWorkout = function(req, res){
    var workoutID = req.query.wid;
    console.log("Attempting to find workout with ID: " + workoutID + " for user: "+ req.session.username);
    Workout.findOne({ username: req.session.username, _id : mongoose.Types.ObjectId(workoutID) })
    .populate('exercises')
    .exec(function(err, obj) {
        if (err) {
            res.json({
                responseCode: 0,
                data: err
            });
        } else {
            res.json({
                responseCode: 1,
                data: obj
            });
        }
    });
};

exports.addWorkout = function(req, res) {
    var wName = req.body.workoutName;
    var wDesc = req.body.activityDesc;
    var wExer = req.body.exercises;

    console.log("Attempting to add workout with name: " + wName + " description: " + wDesc + " exercises: " + wExer);

    var workout = new Workout();
    workout.workoutname = wName;
    workout.workoutdesc = wDesc;
    workout.username = req.session.username;
    for (var i = 0; i < wExer.length; i++) {
        workout.exercises.push(mongoose.Types.ObjectId(wExer[i]));
    }
    workout.save(function(err, obj){
        if (err) {
            res.json({
                responseCode: 0,
                data: err
            });
        } else {
            res.json({
                responseCode: 1,
                id: obj._id
            });
        }
    });
};

exports.removeWorkout = function(req, res) {
    var wID = req.body.id;
    console.log("Attempting to remove workout with id: " + wID);
    Workout.remove({
        username: req.session.username,
        _id: mongoose.Types.ObjectId(wID)
    }, function(err) {
        if (err) {
            res.json({
                responseCode: 0,
                error: err
            });
        } else {
            res.json({
                responseCode: 1
            });
        }
    });
};

exports.updateWorkout = function(req, res){
    var wID = req.body.id;
    var wName = req.body.workoutName;
    var wDesc = req.body.activityDesc;
    var wExer = req.body.exercises;

    console.log("Attempting to update workout with id: " + wID + "name: " + wName + " description: " + wDesc + " exercises: " + wExer);

    var objIDArr = [];
    for (var i = 0; i < wExer.length; i++) {
        objIDArr.push(mongoose.Types.ObjectId(wExer[i]));
    }

    Workout.update({ _id: mongoose.Types.ObjectId(wID) },
        { workoutname : wName, workoutdesc : wDesc, exercises : objIDArr},
        {},
        function (err, raw) {
            if (err) {
                res.json({
                    responseCode: 0,
                    error: err
                });
            } else {
                res.json({
                    responseCode: 1
                });
            }
        }
    );
};

exports.addPerformance = function(req, res){
    var exerciseID = req.body.wid;
    var performanceData = req.body.pdata;
    console.log("Attempting to add performance data for exercise: " + exerciseID + " with data: " + performanceData);
    Performance.create({
        exercise: mongoose.Types.ObjectId(exerciseID),
        pdata: performanceData
    }, function(err, obj) {
        if (err) {
            res.json({
                responseCode: 0,
                error: err
            });
        } else {
            res.json({
                responseCode: 1,
                id: obj._id
            });
        }
    });
};

exports.getMostRecentPerformance = function(req, res){
    var exerciseID = mongoose.Types.ObjectId(req.query.wid);
    console.log("Attempting to get most recent performance for exercise: " + exerciseID);
    Performance.findOne({ exercise : exerciseID}).
    sort({ '_id' : -1}).
    exec(function(err, obj){
        if (err) {
            res.json({
                responseCode: 0,
                error: err
            });
        } else {
            res.json({
                responseCode: 1,
                data : obj
            });
        }
    });
};

exports.getAllPerformances = function(req, res){
    var exerciseID = mongoose.Types.ObjectId(req.query.wid);
    console.log("Attempting to get all performances for exercise: " + exerciseID);
    Performance.find({ exercise : exerciseID}).
    exec(function(err, obj){
        if (err) {
            res.json({
                responseCode: 0,
                error: err
            });
        } else {
            res.json({
                responseCode: 1,
                data : obj
            });
        }
    });
}
