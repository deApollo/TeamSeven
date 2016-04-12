mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    firstname : String,
    lastname : String,
    email : String,
    picture_uri : String,
    preferred_units : String,
    username : { type : String, unique : true, required : true },
    password : {type : String, required : true }
});

UserSchema.methods.getWorkouts = function(callback){
    return this.model('Workout').find({username : this.username},callback);
}

var User = mongoose.model('User',UserSchema);

var ExerciseSchema = new mongoose.Schema({
    username : String,
    exercisename : String,
    exercisetype : String,
    exercisedesc : {
        type: String,
        get: function(data) {
            try {
                return JSON.parse(data);
            } catch (err) {
                return data;
            }
        },
        set: function(data) {
            return JSON.stringify(data);
        }
    }
});

var Exercise = mongoose.model('Exercise', ExerciseSchema)

var WorkoutSchema = new mongoose.Schema({
    workoutname : String,
    workoutdesc : String,
    username : String,
    exercises : [{type : mongoose.Schema.Types.ObjectId, ref : "Exercise"}]
});

WorkoutSchema.pre('remove', function(next) {
    for(var i = 0; i < this.exercises.length; i++){
        Exercise.remove({ _id : this.exercises[i]}).exec();
    }
});

var Workout = mongoose.model('Workout', WorkoutSchema)

module.exports = {
    User : User,
    Exercise : Exercise,
    Workout : Workout
}
