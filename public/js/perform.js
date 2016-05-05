var app = angular.module("performer", ["ngAnimate"]);

app.controller("performance", function($scope, $http, $location) {
    $scope.workout = {
        name: "",
        id: "",
        timesp: 0,
        datelp: -1,
        eids: [],
        exercises: [],
        modified: false
    }; //Object to hold information about the currently loaded workout
    $scope.prevBest = null;
    $scope.currentExercise = 0; //Index of the current exercise being recorded
    $scope.serverMsg = ""; //message to display to the user

    //Variables used for the stopwatch
    $scope.shSeconds = 0;
    $scope.stSeconds = 0;
    $scope.sSeconds = 0;
    $scope.sMinutes = 0;

    var workoutTimeUpdated = false;
    var contentLoaded = false; //Has the workout content been loaded
    var swiID; //The stopwatch js interval id

    angular.element(document).ready(getWorkout);

    /**
     * Function that makes a GET request to a backend endpoint to retrieve
     * the requested workout for the currently logged in user
     *
     * Upon a successful response, it populates the angular scope variables with
     * the data needed to render the UI
     */
    function getWorkout() {
        var workoutID = $location.search().wid;
        $http({
            method: "GET",
            url: "/data/getWorkout?wid=" + workoutID
        }).then(function successCallback(response) {
            console.log(response.data);
            var curW = response.data.data;
            var exerciseArr = [];
            var eids = [];
            for (var j = 0; j < curW.exercises.length; j++) {
                var curE = curW.exercises[j];
                var jsonObj = {
                    name: curE.exercisename,
                    id: curE._id,
                    type: curE.exercisetype,
                    data: JSON.parse(curE.exercisedesc),
                    modified: false,
                    performances: [],
                    last: {
                        avail: false
                    },
                    ret: false
                };
                for(var i = 0; i < jsonObj.data.sets; i++){
                    jsonObj.performances.push({});
                }
                exerciseArr.push(jsonObj);
                eids.push(curE._id);
            }
            $scope.workout = {
                name: curW.workoutname,
                id: curW._id,
                eids: eids,
                exercises: exerciseArr,
                timesp: curW.timesperformed,
                datelp: curW.lastperformed,
                modified: false
            };
            contentLoaded = true;
        }, function errorCallback(response) {
            console.log(response);
        });
    }

    /**
     * Angular global function used to start the stopwatch
     */
    $scope.startStopwatch = function() {
        swiID = setInterval(runStopwatch,10);
    };

    /**
     * Angular global function used to stop the stopwatch
     *
     * @param {object} performances
     *   The performances array to be updated with the time from the stopwatch
     */
    $scope.stopStopwatch = function(performances) {
        clearInterval(swiID);
        for(var i = 0; i < performances.length; i++){
            if(!performances[i].time || [i].time == ""){
                performances[i].time = parseFloat(($scope.sMinutes * 60 + $scope.sSeconds + $scope.stSeconds / 10 + $scope.shSeconds / 100).toFixed(2));
                return;
            }
        }
    };

    /**
     * Angular global function used to reset the stopwatch
     */
    $scope.resetStopwatch = function () {
        $scope.shSeconds = 0;
        $scope.stSeconds = 0;
        $scope.sSeconds = 0;
        $scope.sMinutes = 0;
    };

    /**
     * Actual driver function for the stopwatch
     */
    function runStopwatch() {
        $scope.shSeconds += 1;
        if($scope.shSeconds == 10){
            $scope.stSeconds += 1;
            $scope.shSeconds = 0;
        }
        if($scope.stSeconds == 10){
            $scope.sSeconds += 1;
            $scope.stSeconds = 0;
        }
        if($scope.sSeconds == 60){
            $scope.sMinutes += 1;
            $scope.sSeconds = 0;
        }
        $scope.$apply();
    }

    /**
     * Function to update an exercise
     *
     * Makes a POST request to the backend update exercise endpoint
     *
     * @param {object} exercise
     *   The current exercise to be updated
     */
    function updateExercise(exercise){
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
            } else {
                $scope.serverMsg += "\nThere was an issue modifying the exercise '" + exercise.name + "'!";
            }
        }, function errorCallback(response) {
            console.log(response);
        });
    }

    /**
     * Function used to populate the last best performance for an exercise
     *
     * Makes a POST request to the backend update exercise endpoint
     *
     * @param {object} exercise
     *   The current exercise to get the last best for
     * @param {object} mostrecent
     *   The mostrecent performance data
     */
    function populateNextBest(exercise, mostrecent) {
        if (mostrecent.responseCode == 1 && mostrecent.data) {
            exercise.last.avail = true;
            var tempParse = JSON.parse(mostrecent.data.pdata);
            exercise.last.data = tempParse.data;
        }
    }

    /**
     * Function used to submit performance data for the current exercise
     *
     * Makes a POST request to the backend add performance endpoint
     *
     * @param {object} exercise
     *   The exercise containing the performance data to be submitted
     */
    function submitPerformance(exercise) {
        $http({
            method: "POST",
            url: "/data/addPerformance",
            data: {
                wid: exercise.id,
                pdata: {date : Date.now(), data: exercise.performances}
            }
        }).then(function successCallback(response) {
            console.log(response.data);
            if (response.data.responseCode == 1) {
                $scope.serverMsg += "\nPerformance saved succesfully!";

                if(exercise.type == "Interval"){
                    var time = $scope.getBestInterval(exercise.performances);
                    exercise.data.time = time;
                } else {
                    var performance = $scope.getBestRep(exercise.performances);
                    exercise.data.reps = performance.reps;
                    exercise.data.weight = performance.weight;
                }
                updateExercise(exercise);
                $scope.currentExercise++;
            } else {
                $scope.serverMsg += "\nThere was an issue saving a performance!";
            }
        }, function errorCallback(response) {
            console.log(response);
        });
    }

    /**
     * Function used to get the most recent performance data for a given workout
     *
     * Makes a GET request to the backend get most recent performance endpoint
     *
     * @param {object} exercise
     *   The exercise whose performance data we are trying to get
     * @param {function} callback
     *   The callback to pass the response data to
     */
    function getMostRecentPerformance(exercise, callback) {
        var exerciseID = exercise.id;
        $http({
            method: "GET",
            url: "/data/getMostRecentPerformance?wid=" + exerciseID
        }).then(function successCallback(response) {
            console.log(response.data);
            callback(exercise, response.data);
        }, function errorCallback(response) {
            console.log(response);
        });
    }

    /**
     * Function used to update the last performed information for the workout
     *
     * Makes a POST request to the backend update workout performed endpoint
     *
     */
    function updateWorkout() {
        $http({
            method: "POST",
            url: "/data/updateWorkoutPerformed",
            data: {
                wid : $scope.workout.id,
                times : $scope.workout.timesp+1,
                last : Date.now()
            }
        }).then(function successCallback(response) {
            console.log(response.data);
        }, function errorCallback(response) {
            console.log(response);
        });
    }

    /**
     * Angular global function used to start the add performance data process
     *
     * Validates that the user has filled in the performance data
     *
     * @param {object} exercise
     *   The exercise whose performance data we are trying to submit
     */
    $scope.addPerformance = function(exercise) {
        var failed = false;
        var pkeyCount = 0;
        for(var i = 0; i < exercise.performances.length; i++){
            for (var pkey in exercise.performances[i]) {
                if (exercise.performances[i].hasOwnProperty(pkey)) {
                    pkeyCount += 1;
                    if (!exercise.performances[i][pkey]) {
                        $scope.serverMsg += "You have not filled in " + pkey + " " + i;
                        failed = true;
                    }
                }
            }
        }
        if (pkeyCount < 1) {
            $scope.serverMsg += "You haven\'t filled things in!";
        } else if (!failed){
            $scope.shSeconds = 0;
            $scope.stSeconds = 0;
            $scope.sSeconds = 0;
            $scope.sMinutes = 0;
            submitPerformance(exercise);
        }
    };

    /**
     * Angular global function used to check what exercise for that workout to
     * display at a given moment
     *
     * If it's the current exercises turn it gets the performance data for it
     *
     * @param {object} exercise
     *   The exercise whose performance data we are trying to submit
     */
    $scope.stageCheck = function(exercise) {
        var eIndex = $scope.workout.exercises.indexOf(exercise);
        if ($scope.currentExercise == eIndex) {
            if (exercise.ret == false) {
                getMostRecentPerformance(exercise, populateNextBest);
                exercise.ret = true;
            }
            return true;
        }
        return false;
    };

    /**
     * Angular global function used to check whether all exercises have been
     * completed
     */
    $scope.isDone = function() {
        if ($scope.currentExercise >= $scope.workout.exercises.length) {
            if(!workoutTimeUpdated && contentLoaded){
                workoutTimeUpdated = true;
                updateWorkout();
            }
            return true;
        }
        return false;
    };

    /**
     * Angular global function used to generate a list of numbers
     */
    $scope.getNumber = function(num){
        var ml = [];
        for(var i = 0; i < num; i++){
            ml.push(i);
        }
        return ml;
    };

    /**
     * Angular global function used to get the best interval performance for a
     * given exercises set of performance data
     *
     * @param {object} idata
     *   The performance data
     */
    $scope.getBestInterval = function(idata){
        var bestTime = 10000;
        for(var i = 0; i < idata.length; i++){
            if(idata[i].time < bestTime)
                bestTime = idata[i].time;
        }
        return bestTime;
    };

    /**
     * Angular global function used to get the best rep performance for a
     * given exercises set of performance data
     *
     * @param {object} idata
     *   The performance data
     */
    $scope.getBestRep = function(rdata){
        var bestRep = {reps: 0 , weight : 0};
        for(var i = 0; i < rdata.length; i++){
            var curR = rdata[i];
            if(curR.reps > bestRep.reps){
                if(curR.weight > bestRep.weight){
                    bestRep.reps = curR.reps;
                    bestRep.weight = curR.weight;
                }
            }
        }
        return bestRep;
    };

});
