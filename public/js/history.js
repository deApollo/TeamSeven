var app = angular.module("history", []);

app.controller("historyCtrl", function($scope, $http, $location) {
    $scope.workout = {
        name: "",
        id: "",
        eids: [],
        exercises: [],
        modified: false
    };
    $scope.serverMsg = "";
    $scope.headers = ["Type", "Sets", "Reps/Time", "Weight"];
    $scope.chartData = [];

    angular.element(document).ready(getWorkout);

    function getWorkout() {
        var workoutID = $location.search().wid;
        $http({
            method: "GET",
            url: "/data/getWorkout?wid=" + workoutID
        }).then(function successCallback(response) {
            // console.log(response.data);
            var curW = response.data.data;
            var exerciseArr = [];
            var eids = [];
            for (var j = 0; j < curW.exercises.length; j++) {
                var curE = curW.exercises[j];
                var jsonObj = {
                    name: curE.exercisename,
                    id: curE._id,
                    type: curE.exercisetype,
                    data: JSON.parse(curE.exercisedesc)
                };
                exerciseArr.push(jsonObj);
                eids.push(curE._id);
                getPerformanceData(curE.exercisename, curE._id, exerciseArr[j].data.sets);
            }
            console.log(exerciseArr);
            $scope.workout = {
                name: curW.workoutname,
                id: curW._id,
                eids: eids,
                exercises: exerciseArr
            };
        }, function errorCallback(response) {
            console.log(response);
        });
    }

    function getPerformanceData(exerciseName, exerciseID, exerciseSets) {
        $http({
            method: "GET",
            url: "/data/getAllPerformances?wid=" + exerciseID
        }).then(function successCallback(response) {
            var actualData = [];
            for(var i = 0; i < response.data.data.length; i++){
                actualData.push(JSON.parse(response.data.data[i].pdata));
            }
            for (var i = 0; i < actualData.length; ++i) {
                for (var j = 0; j < exerciseSets - 1; ++j) {
                    var chartItem = {
                        type: exerciseName,
                        sets: exerciseSets,
                        repTime: 0,
                        weight: 0
                    };
                }
                $scope.chartData.push(chartItem);
            }
            console.log(actualData);
        });
    }
});