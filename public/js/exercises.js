var app = angular.module("Workout", ["ngRoute"]);
//var socket = io.connect("http://localhost:3000/");


// The Workout Object: A container for Excercise Objects
function Workout($rootScope){
    this.$rootScope = $rootScope;
    this.name = "";
    this.exercises = [];
}

Workout.prototype.getName = function (){
    return this.name;
};


app.factory("Workout", function($injector){
    return function(name, exercises) {return $injector.instantiate(Workout, {name: name, exercises: exercises}); };
});


// The Excercise Object: Has a name and a type. Depending on the type, the data will change.
function Excercise($rootScope, type){
    this.$rootScope = $rootScope;
    this.name = "";
    this.type = type;
    this.data = {};
    if (type == "Interval"){
        this.data = new IntervalData;
    }
    if (type == "Reps"){
        this.data = new RepData;
    }
}

app.factory("Excercise", function($injector){
    return function(name, type, data) {return $injector.instantiate(Excercise, {name: name, type: type, data: data}); };
});


// Various Excercise data types
function IntervalData($rootScope){
    this.$rootScope = $rootScope;
    this.sets = 0;
    this.time = 0;
}
app.factory("IntervalData", function($injector){
    return function(sets, time) {return $injector.instantiate(Excercise, {sets: sets, time: time}); };
});

function RepData($rootScope){
    this.$rootScope = $rootScope;
    this.sets = 0;
    this.reps = 0;
    this.weight = 0;
}
app.factory("RepData", function($injector){
    return function(sets, reps, weight) {return $injector.instantiate(Excercise, {sets: sets, reps: reps, weight: weight}); };
});


app.controller("WorkoutCtrl", function($scope, $http, Workout){
    $scope.workouts = [];


    $scope.newWorkout = function (){
        $scope.workouts.push(new Workout(this) );
        console.log($scope.workouts);
    }

    $scope.newExcercise = function (workout, type){
        if (type == "Interval" || type == "Reps"){
             workout.exercises.push(new Excercise(this, type) );
        }
        console.log(type, workout.exercises);
    }


});
