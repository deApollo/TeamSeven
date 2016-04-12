var app = angular.module("Workout", ["ngRoute"]);

app.controller("WorkoutCtrl", function($scope, $http){
    $scope.workouts = [];

    angular.element(document).ready(getWorkouts);

    function getWorkouts(){
        $http({
            method: 'GET',
            url: '/data/getWorkouts'
        }).then(function successCallback(response){
            console.log(response.data);
            for(var i = 0; i < response.data.data.length; i++){
                var curW = response.data.data[i];
                var exerciseArr = [];
                var eids = [];
                for(var j = 0; j < curW.exercises.length; j++){
                    var curE = curW.exercises[j];
                    exerciseArr.push({name : curE.exercisename, id : curE._id, type: curE.exercisetype, data : JSON.parse(curE.exercisedesc)});
                    eids.push(curE._id);
                }
                $scope.workouts.push({name : curW.workoutname, id : curW._id, eids: eids, exercises : exerciseArr});
            }
        }, function errorCallback(response) {
            console.log(response);
        });
    };

    function saveHelper(wIndex,eIndex){
        var wLocal = $scope.workouts;
        var curW = wLocal[wIndex];
        if(wIndex < $scope.workouts.length && eIndex < curW.exercises.length){
            addExercise(curW.exercises[eIndex],wIndex,eIndex);
        } else if (wIndex < $scope.workouts.length){
            addWorkout(wLocal[wIndex],wIndex);
            saveHelper(wIndex+1,0);
        }
    };

    function addExercise(exercise, workoutIndex, eIndex){
        $http({
            method: 'POST',
            url: '/data/addExercise',
            data: {
                exerciseName: exercise.name,
                exerciseDesc: exercise.data,
                exerciseType: exercise.type
            }
        }).then(function successCallback(response) {
            console.log(response.data)
            $scope.workouts[workoutIndex].eids.push(response.data.id);
            saveHelper(workoutIndex,eIndex+1);
        }, function errorCallback(response) {
            console.log(response);
        });
    };

    function addWorkout(workout, workoutIndex){
        $http({
            method: 'POST',
            url: '/data/addWorkout',
            data: {
                workoutName: workout.name,
                activityDesc : "",
                exercises: workout.eids
            }
        }).then(function successCallback(response) {
            $scope.workouts[workoutIndex].id = response.data.id;
        }, function errorCallback(response) {
            console.log(response);
        });
    }

    $scope.newWorkout = function (){
        $scope.workouts.push({name : "", id : null, eids: [], exercises : []});
    }

    $scope.newExcercise = function (workout, wtype){
        workout.exercises.push({name : "", id : null, type: wtype, data : {}});
    }

    $scope.saveWorkouts = function(){
        saveHelper(0,0);
    }
});
