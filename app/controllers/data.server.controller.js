/**
 * This file is the main backend endpoint for the application.  It handles all
 * of the database interaction logic.
 */

var mongoose = require("mongoose");
var User = require("./../schema.js").User;
var Exercise = require("./../schema.js").Exercise;
var Workout = require("./../schema.js").Workout;
var Performance = require("./../schema.js").Performance;

/**
 * Backend endpoint for changing the user profile picture
 *
 * Updates the users profile picture to the supplied image
 * Image downloading is handled via a middleware function in the router
 *
 * @param {object} req
 *   The express HTTP request containing the information require for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
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
};

/**
 * Backend endpoint for getting user preferences
 *
 * @param {object} req
 *   The express HTTP request containing the information require for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.getUserPreferences = function(req, res){
    User.findOne({username : req.session.username}, "firstname lastname profile_url preferred_units email", function(err, obj){
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
};


/**
 * Backend endpoint for changing a dynamically assigned user preference
 *
 * @param {object} req
 *   The express HTTP request containing the information require for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
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
};

/**
 * Backend endpoint for getting the exercises for a given user
 *
 * @param {object} req
 *   The express HTTP request containing the information require for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
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

/**
 * Backend endpoint for adding exercises for a given user
 *
 * @param {object} req
 *   The express HTTP request containing the information require for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
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

/**
 * Backend endpoint for removing exercises for a given user
 *
 * @param {object} req
 *   The express HTTP request containing the information require for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
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
};

/**
 * Backend endpoint for updating exercises for a given user
 *
 * @param {object} req
 *   The express HTTP request containing the information require for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.updateExercise = function(req, res) {
    var eID = req.body.id;
    var exName = req.body.exerciseName;
    var exDesc = JSON.stringify(req.body.exerciseDesc);
    console.log("Attempting to update exercise with name: " + exName + " and data: " + exDesc);
    Exercise.update({ _id: mongoose.Types.ObjectId(eID) },
        { exercisename: exName, exercisedesc: exDesc},
        {},
        function (err) {
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

/**
 * Backend endpoint for getting all workouts associated with a given user
 *
 * @param {object} req
 *   The express HTTP request containing the information require for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.getWorkouts = function(req, res) {
    console.log("Attempting to get list of workouts for user: " + req.session.username);
    Workout.find({ username: req.session.username })
    .populate("exercises")
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

/**
 * Backend endpoint for getting a specific workout for a given user
 *
 * @param {object} req
 *   The express HTTP request containing the information require for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.getWorkout = function(req, res){
    var workoutID = req.query.wid;
    console.log("Attempting to find workout with ID: " + workoutID + " for user: "+ req.session.username);
    Workout.findOne({ username: req.session.username, _id : mongoose.Types.ObjectId(workoutID) })
    .populate("exercises")
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

/**
 * Backend endpoint for adding a workout to a given user
 *
 * @param {object} req
 *   The express HTTP request containing the information require for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.addWorkout = function(req, res) {
    var wName = req.body.workoutName;
    var wDesc = req.body.activityDesc;
    var wExer = req.body.exercises;

    console.log("Attempting to add workout with name: " + wName + " description: " + wDesc + " exercises: " + wExer);

    var workout = new Workout();
    workout.workoutname = wName;
    workout.workoutdesc = wDesc;
    workout.username = req.session.username;
    workout.timesperformed = 0;
    workout.lastperformed = -1;
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

/**
 * Backend endpoint for removing a workout from a given user
 *
 * @param {object} req
 *   The express HTTP request containing the information require for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
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

/**
 * Backend endpoint for updating a workout for a given user
 *
 * @param {object} req
 *   The express HTTP request containing the information require for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.updateWorkout = function(req, res){
    var wID = req.body.id;
    var wName = req.body.workoutName;
    var wDesc = req.body.activityDesc;
    var wExer = req.body.exercises;
    var wTimes= req.body.times;
    var wDate = req.body.date;

    console.log("Attempting to update workout with id: " + wID + " name: " + wName + " description: " + wDesc + " exercises: " + wExer);

    var objIDArr = [];
    for (var i = 0; i < wExer.length; i++) {
        objIDArr.push(mongoose.Types.ObjectId(wExer[i].id));
    }

    Workout.update({ _id: mongoose.Types.ObjectId(wID) },
        { workoutname : wName, workoutdesc : wDesc, exercises : objIDArr, timesperformed : wTimes, lastperformed: wDate},
        {},
        function (err) {
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

/**
 * Backend endpoint for updating the last time a workout was performed
 *
 * @param {object} req
 *   The express HTTP request containing the information require for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.updateWorkoutPerformed = function(req, res){
    var wID = req.body.wid;
    var newTimes = req.body.times;
    var newLast = req.body.last;
    console.log("Attempting to update record for workout with id " + wID + " performed " + newTimes + " at time " + newLast);
    Workout.update({ _id: mongoose.Types.ObjectId(wID) },
        { timesperformed : newTimes, lastperformed: newLast},
        {},
        function (err) {
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

/**
 * Backend endpoint for adding performance data for an exercise for a given user
 *
 * @param {object} req
 *   The express HTTP request containing the information require for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
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

/**
 * Backend endpoint for getting the most recent performance of a given exercise
 *
 * @param {object} req
 *   The express HTTP request containing the information require for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
exports.getMostRecentPerformance = function(req, res){
    var exerciseID = mongoose.Types.ObjectId(req.query.wid);
    console.log("Attempting to get most recent performance for exercise: " + exerciseID);
    Performance.findOne({ exercise : exerciseID}).
    sort({ "_id" : -1}).
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

/**
 * Backend endpoint for getting all performances for an exercise for a given user
 *
 * @param {object} req
 *   The express HTTP request containing the information require for the function
 * @param {object} res
 *   The express HTTP response to be sent back to the requester
 */
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
};
