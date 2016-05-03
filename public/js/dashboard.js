var app = angular.module("dashboard", []);

app.controller("dashboard-controller", function($scope, $http) {
    $scope.workouts = [];
    $scope.headers = ["Name" , "Times performed", "Date last performed"];

    $scope.viewHistory = function(id){
        window.location = "/history#?wid=" + id;
    };

    angular.element(document).ready(getWorkouts);

    function getWorkouts() {
        $http({
            method: "GET",
            url: "/data/getWorkouts"
        }).then(function successCallback(response) {
            console.log(response.data);
            for (var i = 0; i < response.data.data.length; i++) {
                var curW = response.data.data[i];
                var exerciseArr = [];
                var eids = [];
                for (var j = 0; j < curW.exercises.length; j++) {
                    var curE = curW.exercises[j];
                    exerciseArr.push({
                        name: curE.exercisename,
                        id: curE._id,
                        type: curE.exercisetype,
                        data: JSON.parse(curE.exercisedesc),
                        modified: false
                    });
                    eids.push(curE._id);
                }
                var today = "never performed!";
                if( curW.lastperformed != -1){
                    today = new Date(curW.lastperformed);
                    var dd = today.getDate();
                    var mm = today.getMonth() + 1;
                    var yyyy = today.getFullYear();
                    if (dd < 10) {
                        dd = "0" + dd;
                    }
                    if (mm < 10) {
                        mm = "0" + mm;
                    }
                    today = mm + "/" + dd + "/" + yyyy;
                }
                $scope.workouts.push({
                    name: curW.workoutname,
                    id: curW._id,
                    eids: eids,
                    exercises: exerciseArr,
                    modified: false,
                    timesp: curW.timesperformed,
                    datelp: today
                });
            }
        }, function errorCallback(response) {
            console.log(response);
        });
    }
});
