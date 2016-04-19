var app = angular.module("Workout", ["ngRoute"]);

app.controller("WorkoutCtrl", function($scope, $http){
    $scope.workouts = [];
    $scope.workout = {};
    $scope.overview = true;
    $scope.serverMsg = "";

    angular.element(document).ready(getWorkouts);

    function getWorkouts(){
        $http({
            method: "GET",
            url: "/data/getWorkouts"
        }).then(function successCallback(response){
            console.log(response.data);
            for(var i = 0; i < response.data.data.length; i++){
                var curW = response.data.data[i];
                var exerciseArr = [];
                var eids = [];
                for(var j = 0; j < curW.exercises.length; j++){
                    var curE = curW.exercises[j];
                    exerciseArr.push({name : curE.exercisename, id : curE._id, type: curE.exercisetype, data : JSON.parse(curE.exercisedesc), modified : false});
                    eids.push(curE._id);
                }
                $scope.workouts.push({name : curW.workoutname, id : curW._id, eids: eids, exercises : exerciseArr, modified : false});
            }
        }, function errorCallback(response) {
            console.log(response);
        });
    }

    function saveHelper(wIndex,eIndex){
        var wLocal = $scope.workouts;
        var curW = wLocal[wIndex];
        if(wIndex < $scope.workouts.length && eIndex < curW.exercises.length){
            var curE = curW.exercises[eIndex];
            if(curE.id == null && curE.modified)
                addExercise(curE,wIndex,eIndex);
            else if(curE.id && curE.modified)
                updateExercise(curE,wIndex,eIndex);
            else
                saveHelper(wIndex,eIndex+1);
        } else if (wIndex < $scope.workouts.length){
            if(wLocal[wIndex].id == null && wLocal[wIndex].modified)
                addWorkout(wLocal[wIndex],wIndex);
            else if(wLocal[wIndex].id && wLocal[wIndex].modified)
                updateWorkout(wLocal[wIndex],wIndex);
            saveHelper(wIndex+1,0);
        }
    }

    function updateExercise(exercise, workoutIndex, eIndex){
        $http({
            method: "POST",
            url: "/data/updateExercise",
            data: {
                id: exercise.id,
                exerciseName: exercise.name,
                exerciseDesc: exercise.data
            }
        }).then(function successCallback(response) {
            console.log(response.data);
            if(response.data.responseCode == 1) {
                $scope.serverMsg += "\nExercise '" + exercise.name + "' modified succesfully!";
                saveHelper(workoutIndex,eIndex+1);
            } else {
                $scope.serverMsg += "\nThere was an issue modifying the exercise '" + exercise.name + "'!";
            }
        }, function errorCallback(response) {
            console.log(response);
        });
    }

    function addExercise(exercise, workoutIndex, eIndex){
        $http({
            method: "POST",
            url: "/data/addExercise",
            data: {
                exerciseName: exercise.name,
                exerciseDesc: exercise.data,
                exerciseType: exercise.type
            }
        }).then(function successCallback(response) {
            console.log(response.data);
            if(response.data.responseCode == 1) {
                $scope.workouts[workoutIndex].eids.push(response.data.id);
                $scope.serverMsg += "\nExercise '" + exercise.name + "' saved succesfully!";
                saveHelper(workoutIndex,eIndex+1);
            } else {
                $scope.serverMsg += "\nThere was an issue saving the exercise '" + exercise.name + "' !";
            }
        }, function errorCallback(response) {
            console.log(response);
        });
    }

    function addWorkout(workout, workoutIndex){
        $http({
            method: "POST",
            url: "/data/addWorkout",
            data: {
                workoutName: workout.name,
                activityDesc : "",
                exercises: workout.eids
            }
        }).then(function successCallback(response) {
            if(response.data.responseCode == 1){
                $scope.workouts[workoutIndex].id = response.data.id;
                $scope.serverMsg += "\nWorkout '" + workout.name + "' saved successfully!";
            } else {
                $scope.serverMsg += "\nThere was an issue saving the workout '" + workout.name + "'!";
            }
        }, function errorCallback(response) {
            console.log(response);
        });
    }

    function updateWorkout(workout, workoutIndex){
        $http({
            method: "POST",
            url: "/data/updateWorkout",
            data: {
                id : workout.id,
                workoutName: workout.name,
                activityDesc : "",
                exercises: workout.eids
            }
        }).then(function successCallback(response) {
            if(response.data.responseCode == 1){
                $scope.workouts[workoutIndex].id = response.data.id;
                $scope.serverMsg += "\nWorkout '" + workout.name + "' modified successfully!";
            } else {
                $scope.serverMsg += "\nThere was an issue modifying the workout '" + workout.name + "'!";
            }
        }, function errorCallback(response) {
            console.log(response);
        });
    }


    $scope.removeWorkout = function(workout){
        if(workout.id){
            $http({
                method: "POST",
                url: "/data/removeWorkout",
                data: {
                    id : workout.id
                }
            }).then(function successCallback(response) {
                if(response.data.responseCode == 1){
                    $scope.serverMsg += "\nWorkout '" + workout.name + "' removed successfully!";
                } else {
                    $scope.serverMsg += "\nThere was an issue removing the workout '" + workout.name + "'!";
                }
            }, function errorCallback(response) {
                console.log(response);
            });
        }
        $scope.workouts.splice($scope.workouts.indexOf(workout),1);
    };

    $scope.removeExercise = function(workout,exercise){
        var wIndex = $scope.workouts.indexOf(workout);
        var eIndex = $scope.workouts[wIndex].exercises.indexOf(exercise);
        if(exercise.id){
            $http({
                method: "POST",
                url: "/data/removeExercise",
                data: {
                    id : exercise.id
                }
            }).then(function successCallback(response) {
                if(response.data.responseCode == 1){
                    $scope.serverMsg += "\nExercise '" + exercise.name + "' removed successfully!";
                } else {
                    $scope.serverMsg += "\nThere was an issue removing the exercise '" + exercise.name + "'!";
                }
            }, function errorCallback(response) {
                console.log(response);
            });
        }
        $scope.workouts[wIndex].exercises.splice(eIndex,1);
    };

    $scope.newWorkout = function (){
        var index = $scope.workouts.length;
        var increaseInterval = {sets: 0, interval: 0};
        var increaseReps = {sets: 0, reps: 0, weight: 0};
        $scope.workouts.push({name : "New Workout", id : null, eids: [], exercises : [], modified : false, 
            increase_interval: increaseInterval, increase_reps: increaseReps});
        $scope.editWorkout(index);
    };

    $scope.newExercise = function (workout, wtype){
        if(wtype){
            workout.exercises.push({name : "", id : null, type: wtype, data : {}, modified : false});
            workout.modified = true;
        }
    };

    $scope.saveWorkouts = function(){
        saveHelper(0,0);
    };

    $scope.modify = function(item){
        item.modified = true;
    };

    $scope.editWorkout = function(index){
        $scope.overview = false;
        $scope.workout = $scope.workouts[index];
    }

    $scope.doOverview = function(){
        $scope.overview = true;
    }
});
