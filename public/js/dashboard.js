var app = angular.module("dashboard", []);

app.controller("dashboard-controller", function($scope, $http) {
    $scope.workouts = [];
    $scope.headers = ["Workout" , "Times performed", "Date last performed", "View"];

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
                var lastP = "Never performed";
                if( curW.lastperformed != -1){
                    lastP = new Date(curW.lastperformed);
                    var now = Date.now();
                    var timeDiff = Math.abs(lastP - now);
                    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    if(new Date().getDate() == lastP.getDate())
                        lastP = "Today"
                    else if(diffDays > 1)
                        lastP = diffDays + " days ago";
                    else if (diffDays == 1)
                        lastP = "1 day ago";
                }
                $scope.workouts.push({
                    name: curW.workoutname,
                    id: curW._id,
                    eids: eids,
                    exercises: exerciseArr,
                    modified: false,
                    timesp: curW.timesperformed,
                    datelp: lastP
                });
            }
        }, function errorCallback(response) {
            console.log(response);
        });
    }
});
