var app = angular.module("performer", []);

app.controller("performance", function($scope, $http, $location) {
    $scope.workout = {
        name: "",
        id: "",
        eids: [],
        exercises: [],
        modified: false
    };
    $scope.prevBest = null;
    $scope.currentExercise = 0;
    $scope.serverMsg = "";

    angular.element(document).ready(getWorkout);

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
                exerciseArr.push({
                    name: curE.exercisename,
                    id: curE._id,
                    type: curE.exercisetype,
                    data: JSON.parse(curE.exercisedesc),
                    modified: false,
                    performance: {},
                    last: {
                        avail: false
                    },
                    ret: false
                });
                eids.push(curE._id);
            }
            $scope.workout = {
                name: curW.workoutname,
                id: curW._id,
                eids: eids,
                exercises: exerciseArr,
                modified: false
            };
        }, function errorCallback(response) {
            console.log(response);
        });
    }

    function populateNextBest(exercise, mostrecent) {
        if (mostrecent.responseCode == 1 && mostrecent.data) {
            exercise.last.avail = true;
            exercise.last.data = JSON.parse(mostrecent.data.pdata);
        }
    }

    function submitPerformance(exercise) {
        $http({
            method: "POST",
            url: "/data/addPerformance",
            data: {
                wid: exercise.id,
                pdata: exercise.performance
            }
        }).then(function successCallback(response) {
            console.log(response.data);
            if (response.data.responseCode == 1) {
                $scope.serverMsg += "\Performance saved succesfully!";
            } else {
                $scope.serverMsg += "\nThere was an issue saving a performance!";
            }
        }, function errorCallback(response) {
            console.log(response);
        });
        $scope.currentExercise++;
    }

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

    $scope.addPerformance = function(exercise) {
        var failed = false;
        var pkeyCount = 0;
        for (var pkey in exercise.performance) {
            if (exercise.performance.hasOwnProperty(pkey)) {
                pkeyCount += 1;
                if (!exercise.performance[pkey]) {
                    $scope.serverMsg = "You have not filled in " + pkey;
                    failed = true;
                }
            }
        }
        if (pkeyCount < 2) {
            $scope.serverMsg = "You haven\'t filled in anything!";
        } else if (!failed)
            submitPerformance(exercise);
    };

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

    $scope.isDone = function() {
        if ($scope.currentExercise >= $scope.workout.exercises.length) {
            return true;
        }
        return false;
    };
});
app.config(function($locationProvider) {
    $locationProvider.html5Mode(true).hashPrefix("!");
});
