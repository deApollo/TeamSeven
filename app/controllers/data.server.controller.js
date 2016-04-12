var mongoose = require('mongoose');
var User = require('./../schema.js').User;
var Exercise = require('./../schema.js').Exercise;
var Workout = require('./../schema.js').Workout;

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
                id: obj.id
            });
        }
    });
};

exports.removeExercise = function(req, res) {
    var eID = req.body.id;
    Exercise.remove({
        username: req.session.username,
        id: eID
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
                id: obj.id
            });
        }
    });
};

exports.removeWorkout = function(req, res) {
    var wID = req.body.id;
    Workout.remove({
        username: req.session.username,
        id: wID
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
