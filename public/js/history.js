var app = angular.module("history", []);

app.controller("historyCtrl", function($scope, $http, $location) {
    repData = []
    
    intData = [];

    var myRepGraph = Morris.Line({
      element: 'repGraph',
      data: repData,
      xkey: 'y',
      ykeys: ['a'],
      labels: ['Weight']
    });

    var myIntGraph = Morris.Line({
      element: 'intGraph',
      data: intData,
      xkey: 'y',
      ykeys: ['a'],
      labels: ['Time']
    });

    $scope.serverMsg = "";
    $scope.headers = ["Type", "Sets", "Reps/Time", "Weight"];
    $scope.intChartData = [];
    $scope.repChartData = [];

    angular.element(document).ready(getWorkout);

    function getWorkout() {
        var count = 0;
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
                getPerformanceData(curE.exercisename, curE._id, exerciseArr[j].data.sets, exerciseArr[j].type, repData, intData, count);
            }
            console.log("FIRST REP DATA");
            console.log(repData);
            
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

    function getPerformanceData(exerciseName, exerciseID, exerciseSets, exerciseType, repData, intData, count) {
        $http({
            method: "GET",
            url: "/data/getAllPerformances?wid=" + exerciseID
        }).then(function successCallback(response) {
            var actualData = [];
            console.log(exerciseType);
            for(var i = 0; i < response.data.data.length; i++){
                actualData.push(JSON.parse(response.data.data[i].pdata));
            }
            console.log("PDATA");
            console.log(actualData.length);
            console.log(actualData);
            console.log(exerciseSets);
            console.log("STOP");
            if (exerciseType == "Interval") {
                for (var i = 0; i < actualData.length; ++i) {
                    for (var j = 0; j < exerciseSets; ++j) {
                        var intChartItem = {
                            type: exerciseName,
                            time: actualData[i].data[j].time,
                            date: actualData[i].date
                        };
                        $scope.intChartData.push(intChartItem);
                    }
                }
            }
            console.log("HERE'S WHAT WE GOT FOR INTERVALS");
            console.log($scope.intChartData);
            if (exerciseType == "Reps") {
                for (var i = 0; i < actualData.length; ++i) {
                    for (var j = 0; j < exerciseSets; ++j) {
                        var repChartItem = {
                            type: exerciseName,
                            sets: exerciseSets,
                            reps: actualData[i].data[j].reps,
                            weight: actualData[i].data[j].weight,
                            date: actualData[i].date
                        };
                        $scope.repChartData.push(repChartItem);
                    }
                }
            }
            console.log("HERE'S WHAT WE GOT FOR REPS");
            console.log($scope.repChartData);

            var intFormat = $scope.intChartData.length;
            var intString = [];
            for (var i = 0; i < intFormat; ++i) {
                var intDate = $scope.intChartData[i].date;
                var intType = $scope.intChartData[i].type;
                var intTime = $scope.intChartData[i].time;
                intString.push({y: intDate, a: intTime});
            }
            intData = intString;
            console.log("HERE IS INTDATA");
            console.log(intData);

            var repFormat = $scope.repChartData.length;
            var repString = [];
            for (var i = 0; i < repFormat; ++i) {
                var repDate = $scope.repChartData[i].date;
                // var repReps = $scope.repChartData[i].reps;
                // var repSets = $scope.repChartData[i].sets;
                // var repType = $scope.repChartData[i].type;
                var repWeight = $scope.repChartData[i].weight;
                repString.push({y: repDate, a: repWeight});
            }

            repData = repString;
            console.log("HERE IS REPDATA");
            console.log(repData);
            updateGraph(repData, intData, myRepGraph, myIntGraph);
        });
    }
    $scope.workout = {
        name: "",
        id: "",
        eids: [],
        exercises: [],
        modified: false
    };
    
    function updateGraph(repData, intData, myRepGraph, myIntGraph) {
        myRepGraph.setData(repData);
        myIntGraph.setData(intData);
    }
});