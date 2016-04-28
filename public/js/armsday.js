var app = angular.module("Armsday", ["ngRoute"]);

app.controller("ArmsdayCtrl", function($scope, $http) {
    $scope.workouts = [];
    $scope.workout = {};
    $scope.overview = true;
    $scope.serverMsg = "";

    angular.element(document).ready(getWorkouts);

    function getWorkouts() {
        $http({
            method: "GET",
            url: "/data/getWorkouts"
        }).then(function successCallback(response) {
            console.log(response.data);
            for (var i = 0; i < response.data.data.length; ++i) {
                var curW = response.data.data[i];
                var exerciseArr = [];
                var eids = [];
                for (var j = 0; j < curW.exercises.length; ++j) {
                    var curE = curW.exercises[j];
                    exerciseArr.push({name : curE.exerciseName, id : curE._id, type : curE.exercisetype, data : JSON.parse(curE.exercisedesc), modified : false});
                    eids.push(curE._id);
                }
                $scope.workouts.push({name : curW.workoutname, id : curW._id, eids : eids, exercises : exerciseArr, modified : false});
            }
        }, function errorCallback(response) {
            console.log(response);
        });
    }
});