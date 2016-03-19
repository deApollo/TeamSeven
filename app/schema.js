mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    firstname : String,
    lastname : String,
    email : String,
    profile_url : String,
    preferred_units : String,
    username : { type : String, unique : true, required : true },
    password : {type : String, required : true }
});

UserSchema.methods.getWorkouts = function(callback){
    return this.model('Workout').find({username : this.username},callback);
}

var User = module.exports = mongoose.model('User',UserSchema);

var ExerciseSchema = new mongoose.Schema({
    username : String,
    excercisename : String,
    excercisedesc : String
});

ExerciseSchema.index({username : 1, excercisename : 1}, {unique : true});

var Exercise = module.exports = mongoose.model('Exercise', ExerciseSchema)

var WorkoutSchema = new mongoose.Schema({
    workoutname : String,
    workoutdesc : String,
    username : String,
    exercises : [{type : mongoose.Schema.Types.ObjectId, ref : "Exercise"}]
});

WorkoutSchema.index({workoutname : 1, username : 1}, {unique : true});

var Workout = module.exports = mongoose.model('Workout', WorkoutSchema)
