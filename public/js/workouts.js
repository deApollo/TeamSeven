var app = angular.module("Workout", ["ngRoute", "ui.sortable"]);

app.controller("WorkoutCtrl", function($scope, $http){
    $scope.workouts = []; //A list of all workouts - stored as JSON objects
    $scope.workout = {}; //The currently active workout in the edit div
    $scope.overview = true; //Whether or not to display the edit div or the overview
    $scope.serverMsg = ""; //Used to display strings to the user
    $scope.editingOff = true; //Whether or not the fields in the editing screen are enabled

    //Options variable for the ui.sortable plugin
    //Defines a function to call once a sortable element has finished moving
    //In this case, the function updates a list of exercise ids stored in the
    //workout to reflect the current actual ordering
    $scope.sortableOptions = {
        stop: function() {
            $scope.workout.modified = true;
            $scope.workout.eids = [];
            for(var i = 0; i < $scope.workout.exercises.length; i++){
                $scope.workout.eids.push($scope.workout.exercises[i].id);
            }
        }
    };

    angular.element(document).ready(getWorkouts);

    /**
     * Function that makes a GET request to a backend endpoint to retrieve
     * all workouts for the currently logged in user
     *
     * Upon a successful response, it populates the angular scope variables with
     * the data needed to render the UI
     */
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
                $scope.workouts.push({name : curW.workoutname, id : curW._id, eids: eids, exercises : exerciseArr, modified : false, timesp : curW.timesperformed, datelp : curW.lastperformed});
            }
        }, function errorCallback(response) {
            console.log(response);
        });
    }

    /**
     * Recursive function used to dynamically save changed exercises and workouts
     *
     * Recurses through all workouts and sub exercises saving/adding ones marked
     * by a modified flag
     *
     * @param {integer} wIndex
     *   The index of the current workout in the recursion
     * @param {integer} eIndex
     *   The index of the current exercise for a given workout in the recursion
     */
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

    /**
     * Helper function to saveHelper used to update an exercise
     *
     * Makes a POST request to the backend update exercise endpoint and then
     * calls saveHelper again to continue the recursion
     *
     * @param {object} exercise
     *   The current exercise in the recursion to be updated
     * @param {integer} workoutIndex
     *   The index of that workout in the global workout array
     * @param {integer} eIndex
     *   The index of that exercise in the exercise array for that workout
     */
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

    /**
     * Helper function to saveHelper used to add a new exercise
     *
     * Makes a POST request to the backend add exercise endpoint and then
     * calls saveHelper again to continue the recursion
     *
     * @param {object} exercise
     *   The current exercise in the recursion to be updated
     * @param {integer} workoutIndex
     *   The index of that workout in the global workout array
     * @param {integer} eIndex
     *   The index of that exercise in the exercise array for that workout
     */
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
                exercise.id = response.data.id;
                $scope.serverMsg += "\nExercise '" + exercise.name + "' saved succesfully!";
                saveHelper(workoutIndex,eIndex+1);
            } else {
                $scope.serverMsg += "\nThere was an issue saving the exercise '" + exercise.name + "' !";
            }
        }, function errorCallback(response) {
            console.log(response);
        });
    }

    /**
     * Function used to add a new workout for a given user
     *
     * Makes a POST request to the backend add workout endpoint
     *
     * @param {object} workout
     *   The current workout to be updated
     * @param {integer} workoutIndex
     *   The index of that workout in the global workout array
     */
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

    /**
     * Function used to update a workout for a given user
     *
     * Makes a POST request to the backend update workout endpoint
     *
     * @param {object} workout
     *   The current workout to be updated
     */
    function updateWorkout(workout){
        $http({
            method: "POST",
            url: "/data/updateWorkout",
            data: {
                id : workout.id,
                workoutName: workout.name,
                activityDesc : "",
                exercises: workout.exercises,
                times : workout.timesp,
                date : workout.datelp
            }
        }).then(function successCallback(response) {
            if(response.data.responseCode == 1){
                $scope.serverMsg += "\nWorkout '" + workout.name + "' modified successfully!";
            } else {
                $scope.serverMsg += "\nThere was an issue modifying the workout '" + workout.name + "'!";
            }
        }, function errorCallback(response) {
            console.log(response);
        });
    }

    /**
     * Function used to remove a workout for a given user
     *
     * Makes a POST request to the backend remove workout endpoint
     *
     * @param {object} workout
     *   The current workout to be removed
     */
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

    /**
     * Function used to remove an exercise for a given user
     *
     * Makes a POST request to the backend remove exercise endpoint
     *
     * @param {object} workout
     *   The workout to be updated
     * @param {object} exercise
     *   The exercise to be removed
     */
    $scope.removeExercise = function(workout,exercise){
        var eIndex = $scope.workout.exercises.indexOf(exercise);
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
        $scope.workout.exercises.splice(eIndex,1);
    };

    /**
     * Angular global function used to create a new empty workout object
     *
     * The workout is not added to the database until the user hits save
     */
    $scope.newWorkout = function (){
        var index = $scope.workouts.length;
        var increaseInterval = {sets: 0, interval: 0};
        var increaseReps = {sets: 0, reps: 0, weight: 0};
        $scope.workouts.push({name : "New Workout", id : null, eids: [], exercises : [], modified : false,
            increase_interval: increaseInterval, increase_reps: increaseReps});
        $scope.editWorkout(index);
    };

    /**
     * Angular global function used to create a new empty exercise object
     *
     * The exercise is not added to the database until the user hits save
     *
     * @param {object} workout
     *   The workout to be updated
     * @param {string} wtype
     *   The exercise type to be added
     */
    $scope.newExercise = function (workout, wtype){
        if(wtype){
            workout.exercises.push({name : "", id : null, type: wtype, data : {}, modified : false});
            workout.modified = true;
        }
    };

    /**
     * Angular global function used to begin the saving process
     */
    $scope.saveWorkouts = function(){
        saveHelper(0,0);
        $scope.editingOff = true;
    };

    /**
     * Angular global function used to mark an object as modified
     *
     * @param {object} item
     *   The item to be marked as modified
     */
    $scope.modify = function(item){
        item.modified = true;
    };

    /**
     * Angular global function used to enable editing
     *
     * @param {integer} index
     *   The index of the workout to edit
     */
    $scope.editWorkout = function(index){
        $scope.overview = false;
        $scope.workout = $scope.workouts[index];
        $scope.editingOff = false;
    };

    /**
     * Angular global function used to enable overview mode
     */
    $scope.doOverview = function(){
        $scope.overview = true;
    };

    /**
     * Angular global function used to toggle edit mode
     */
    $scope.toggleEdit = function(){
        $scope.editingOff = !$scope.editingOff;
    };
});
