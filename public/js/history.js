var app = angular.module("history", []);

app.controller("historyCtrl", function($scope, $http, $location) {
    var repData = [];
    var intData = [];

    var myRepGraph = Morris.Line({
        element: "repGraph",
        data: repData,
        xkey: "y",
        ykeys: ["a"],
        labels: ["Weight"]
    });

    var myIntGraph = Morris.Line({
        element: "intGraph",
        data: intData,
        xkey: "y",
        ykeys: ["a"],
        labels: ["Time"]
    });

    $scope.serverMsg = "";
    $scope.repHeaders = ["Date", "Type", "Sets", "Reps", "Weight"];
    $scope.intHeaders = ["Date", "Type", "Sets", "Time"];
    $scope.intChartData = [];
    $scope.repChartData = [];

    angular.element(document).ready(getWorkout);

    function getWorkout() {
        var workoutID = $location.search().wid;
        $http({
            method: "GET",
            url: "/data/getWorkout?wid=" + workoutID
        }).then(function successCallback(response) {
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
                getPerformanceData(curE.exercisename, curE._id, exerciseArr[j].data.sets, exerciseArr[j].type, repData, intData);
            }
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

    function getPerformanceData(exerciseName, exerciseID, exerciseSets, exerciseType, repData, intData) {
        $http({
            method: "GET",
            url: "/data/getAllPerformances?wid=" + exerciseID
        }).then(function successCallback(response) {
            var actualData = [];
            for (var i = 0; i < response.data.data.length; i++) {
                actualData.push(JSON.parse(response.data.data[i].pdata));
            }
            if (exerciseType == "Interval") {
                for (var i = 0; i < actualData.length; ++i) {
                    for (var j = 0; j < exerciseSets; ++j) {
                        var d = new Date(actualData[i].date);
                        var month = "" + (d.getMonth() + 1);
                        var day = "" + d.getDate();
                        var year = d.getFullYear();
                        var hours = d.getHours();
                        var minutes = d.getMinutes();
                        var seconds = d.getSeconds();
                        if (month.length < 2) month = "0" + month;
                        if (day.length < 2) day = "0" + day;
                        var intChartItem = {
                            type: exerciseName,
                            sets: exerciseSets,
                            time: actualData[i].data[j].time,
                            date: [hours, minutes, seconds].join(":") + " " + [month, day, year].join("-"),
                            numdate: actualData[i].date
                        };
                        $scope.intChartData.push(intChartItem);
                    }
                }
            }
            if (exerciseType == "Reps") {
                for (var i = 0; i < actualData.length; ++i) {
                    for (var j = 0; j < exerciseSets; ++j) {
                        var d = new Date(actualData[i].date);
                        var month = "" + (d.getMonth() + 1);
                        var day = "" + d.getDate();
                        var year = d.getFullYear();
                        var hours = d.getHours();
                        var minutes = d.getMinutes();
                        var seconds = d.getSeconds();
                        if (month.length < 2) month = '0' + month;
                        if (day.length < 2) day = '0' + day;
                        var repChartItem = {
                            type: exerciseName,
                            sets: exerciseSets,
                            reps: actualData[i].data[j].reps,
                            weight: actualData[i].data[j].weight,
                            date: [hours, minutes, seconds].join(":") + " " + [month, day, year].join("-"),
                            numdate: actualData[i].date
                        };
                        $scope.repChartData.push(repChartItem);
                    }
                }
            }
            var intFormat = $scope.intChartData.length;

            var intKeys = [];

            for (var i = 0; i < intFormat.length; ++i) {
                console.log(intKeys.length);
                var found = false;
                if (intKeys.length != 0) {
                    for (var j = 0; j < intKeys.length; ++j) {
                        if ($scope.intChartData[i].type == intKeys[j]) {
                            found = true;
                        }
                    }
                }
                if (!found) {
                    intKeys.push('"' + $scope.intChartData[i].type + '"');
                }
            }

            console.log(intKeys);

            var intString = [];

            if ($scope.intChartData.length != 0) {
                var intFirstDate = $scope.intChartData[0].numdate;
                var intBestTime = $scope.intChartData[0].time;

                for (var i = 1; i < intFormat; ++i) {
                    if (intFirstDate != $scope.intChartData[i].numdate) {
                        intString.push({
                            y: intFirstDate,
                            a: intBestTime
                        });
                        intFirstDate = $scope.intChartData[i].numdate;
                        intBestTime = $scope.intChartData[i].time;
                    }
                    if (intBestTime < $scope.intChartData[i].time) {
                        intBestTime = $scope.intChartData[i].time;
                    }
                }
                intString.push({
                    y: intFirstDate,
                    a: intBestTime
                });
                intData = intString;
            }

            var repFormat = $scope.repChartData.length;
            var repString = [];

            if ($scope.repChartData.length != 0) {
                var repFirstDate = $scope.repChartData[0].numdate;
                var repBestWeight = $scope.repChartData[0].weight;
            

                for (var i = 0; i < repFormat; ++i) {
                    if (repFirstDate != $scope.repChartData[i].numdate) {
                        repString.push({
                            y: repFirstDate,
                            a: repBestWeight
                        });
                        repFirstDate = $scope.repChartData[i].numdate;
                        repBestWeight = $scope.repChartData[i].weight;
                    }
                    if (repBestWeight < $scope.repChartData[i].weight) {
                        repBestWeight = $scope.repChartData[i].weight;
                    }
                }
                repString.push({
                    y: repFirstDate,
                    a: repBestWeight
                });
                repData = repString;
            }

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

app.filter("reverse", function() {
    return function(items) {
        return items.slice().reverse();
    };
});
