var app = angular.module("history", []);

app.directive('linechart', function() {

    return {

        // required to make it work as an element
        restrict: 'E',
        template: '<div></div>',
        replace: true,
        // observe and manipulate the DOM
        link: function($scope, element, attrs) {

            var data = $scope[attrs.data],
                xkey = $scope[attrs.xkey],
                ykeys= $scope[attrs.ykeys],
                labels= $scope[attrs.labels];

            Morris.Line({
                    element: element,
                    data: data,
                    xkey: xkey,
                    ykeys: ykeys,
                    labels: labels
                });

        }

    };

});

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

    $scope.xkey = 'y';
  
    $scope.ykeys = ['a', 'b'];
      
    $scope.labels = ['Series A', 'Series B'];
    
    $scope.myModel = [
      { y: '2006', a: 100, b: 90 },
      { y: '2007', a: 75,  b: 65 },
      { y: '2008', a: 50,  b: 40 },
      { y: '2009', a: 75,  b: 65 },
      { y: '2010', a: 50,  b: 40 },
      { y: '2011', a: 75,  b: 65 },
      { y: '2012', a: 100, b: 90 }
    ];

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
            console.log(actualData.length);
            // for (var i = 0; i < actualData.length; ++i) {
                for (var j = 0; j < exerciseSets; ++j) {
                    var chartItem = {
                        type: exerciseName,
                        sets: exerciseSets,
                        repTime: actualData[0][j].time + " seconds",
                        weight: actualData[0][j].weight
                    };
                    $scope.chartData.push(chartItem);
                }
            // }
            console.log(actualData);
        });
    }
});