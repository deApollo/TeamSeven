var mongoose = require('mongoose');

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
    Exercise.create({
        username: req.session.username,
        excercisename: exName,
        excercisedesc: exDesc
    }, function(err, obj) {
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

exports.removeExercise = function(req, res) {
    var exName = req.body.exerciseName;
    Exercise.remove({
        username: req.session.username,
        exercisename: exName
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

exports.getWorkouts = function(req, res) {
    Workout.find({
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

exports.addWorkout = function(req, res) {
    var wName = req.body.workoutName;
    var wDesc = req.body.activityDesc;
    var wExer = req.body.exercises;

    var workout = new Workout();
    workout.workoutname = wName;
    workout.workoutdesc = wDesc;
    workout.username = req.session.username;
    for (var i = 0; i < wExer.length; i++) {
        workout.exercises.push(wExer[i]);
    }
    workout.save();
};

exports.removeWorkout = function(req, res) {
    var wName = req.body.workoutName;
    Workout.remove({
        username: req.session.username,
        workoutname: wName
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
