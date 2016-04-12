var app = angular.module("Workout", ["ngRoute"]);

app.controller("WorkoutCtrl", function($scope, $http){
    $scope.workouts = [];
    $scope.serverMsg = "";

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
                    exerciseArr.push({name : curE.exercisename, id : curE._id, type: curE.exercisetype, data : JSON.parse(curE.exercisedesc), modified : false});
                    eids.push(curE._id);
                }
                $scope.workouts.push({name : curW.workoutname, id : curW._id, eids: eids, exercises : exerciseArr, modified : false});
            }
        }, function errorCallback(response) {
            console.log(response);
        });
    };

    function saveHelper(wIndex,eIndex){
        var wLocal = $scope.workouts;
        var curW = wLocal[wIndex];
        if(wIndex < $scope.workouts.length && eIndex < curW.exercises.length){
            if(curW.id == null && curW.modified)
                addExercise(curW.exercises[eIndex],wIndex,eIndex);
            else if(curW.id && curW.modified)
                updateExercise(curW.exercises[eIndex],wIndex,eIndex);
        } else if (wIndex < $scope.workouts.length){
            if(wLocal[wIndex].id == null && wLocal[wIndex].modified)
                addWorkout(wLocal[wIndex],wIndex);
            else if(wLocal[wIndex].id && wLocal[wIndex].modified)
                updateWorkout(wLocal[wIndex],wIndex);
            saveHelper(wIndex+1,0);
        }
    };

    function updateExercise(exercise, workoutIndex, eIndex){
        $http({
            method: 'POST',
            url: '/data/updateExercise',
            data: {
                id: exercise.id,
                exerciseName: exercise.name,
                exerciseDesc: exercise.data
            }
        }).then(function successCallback(response) {
            console.log(response.data)
            if(response.data.responseCode == 1) {
                $scope.serverMsg += "\nExercise modified succesfully!";
                saveHelper(workoutIndex,eIndex+1);
            } else {
                $scope.serverMsg += "\nThere was an issue modifying an exercise!";
            }
        }, function errorCallback(response) {
            console.log(response);
        });
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
            if(response.data.responseCode == 1) {
                $scope.workouts[workoutIndex].eids.push(response.data.id);
                $scope.serverMsg += "\nExercise saved succesfully!";
                saveHelper(workoutIndex,eIndex+1);
            } else {
                $scope.serverMsg += "\nThere was an issue saving an exercise!";
            }
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
            if(response.data.responseCode == 1){
                $scope.workouts[workoutIndex].id = response.data.id;
                $scope.serverMsg += "\nWorkout saved successfully!";
            } else {
                $scope.serverMsg += "\nThere was an issue saving a workout!";
            }
        }, function errorCallback(response) {
            console.log(response);
        });
    }

    function updateWorkout(workout, workoutIndex){
        $http({
            method: 'POST',
            url: '/data/updateWorkout',
            data: {
                id : workout.id,
                workoutName: workout.name,
                activityDesc : "",
                exercises: workout.eids
            }
        }).then(function successCallback(response) {
            if(response.data.responseCode == 1){
                $scope.workouts[workoutIndex].id = response.data.id;
                $scope.serverMsg += "\nWorkout modified successfully!";
            } else {
                $scope.serverMsg += "\nThere was an issue modifying a workout!";
            }
        }, function errorCallback(response) {
            console.log(response);
        });
    }

    $scope.newWorkout = function (){
        $scope.workouts.push({name : "", id : null, eids: [], exercises : [], modified : false});
    }

    $scope.newExcercise = function (workout, wtype){
        workout.exercises.push({name : "", id : null, type: wtype, data : {}, modified : false});
        workout.modified = true;
    }

    $scope.saveWorkouts = function(){
        saveHelper(0,0);
    }

    $scope.modifiy = function(item){
        item.modified = true;
    }
});
