var app = angular.module("history", []);

app.controller("historyCtrl", function($scope, $http, $location) {

    $scope.serverMsg = "";
    $scope.repHeaders = ["Date", "Type", "Sets", "Reps", "Weight"];
    $scope.intHeaders = ["Date", "Type", "Sets", "Time"];
    $scope.intChartData = [];
    $scope.repChartData = [];

    function updateGraph(repData, myRepGraph, intData, myIntGraph) {
        myRepGraph.setData(repData);
        myIntGraph.setData(intData);
    }

    function getPerformanceData(exerciseName, exerciseID, exerciseSets, exerciseType, repData, intData, myRepGraph, myIntGraph) {
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
                        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        var d = new Date(actualData[i].date);
                        var month = months[d.getMonth()];
                        var day = d.getDate();
                        var year = d.getFullYear();
                        var minutes = d.getMinutes();
                        var hours = d.getHours();
                        if (hours > 12) {
                            hours -= 12;
                            minutes += ' pm';
                        }
                        else if (hours == 0) {
                            hours = 12;
                            minutes += ' am';
                        }
                        else if (hours == 12) {
                            minutes += ' pm';
                        }
                        else {
                            minutes += ' am';
                        }
                        var intChartItem = {
                            type: exerciseName,
                            sets: exerciseSets,
                            time: actualData[i].data[j].time,
                            date: month + ' ' + day + ', ' + year + ' ' + hours + ':' + minutes,
                            numdate: actualData[i].date
                        };
                        $scope.intChartData.push(intChartItem);
                    }
                }
            }
            if (exerciseType == "Reps") {
                for (var i = 0; i < actualData.length; ++i) {
                    for (var j = 0; j < exerciseSets; ++j) {
                        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        var d = new Date(actualData[i].date);
                        var month = months[d.getMonth()];
                        var day = d.getDate();
                        var year = d.getFullYear();
                        var minutes = d.getMinutes();
                        var hours = d.getHours();
                        if (hours > 12) {
                            hours -= 12;
                            minutes += ' pm';
                        }
                        else if (hours == 0) {
                            hours = 12;
                            minutes += ' am';
                        }
                        else if (hours == 12) {
                            minutes += ' pm';
                        }
                        else {
                            minutes += ' am';
                        }
                        var repChartItem = {
                            type: exerciseName,
                            sets: exerciseSets,
                            reps: actualData[i].data[j].reps,
                            weight: actualData[i].data[j].weight,
                            date: month + ' ' + day + ', ' + year + ' ' + hours + ':' + minutes,
                            numdate: actualData[i].date
                        };
                        $scope.repChartData.push(repChartItem);
                    }
                }
            }
            var intFormat = $scope.intChartData.length;

            // for (var i = 0; i < intFormat; ++i) {
            //     var found = false;
            //     for (var j = 0; j < intKeys.length; ++j) {
            //         if ($scope.intChartData[i].type == intKeys[j]) {
            //             found = true;
            //             break;
            //         }
            //     }
                
            //     if (!found) {
            //         intKeys.push($scope.intChartData[i].type);
            //     }
            // }

            var intString = [];

            if ($scope.intChartData.length != 0) {
                var intFirstDate = $scope.intChartData[0].numdate;
                var intBestTime = $scope.intChartData[0].time;
                // var intType = $scope.intChartData[0].type;

                for (var i = 1; i < intFormat; ++i) {
                    if (intFirstDate != $scope.intChartData[i].numdate) {
                        intString.push({
                            y: intFirstDate,
                            a: intBestTime
                        });
                        intFirstDate = $scope.intChartData[i].numdate;
                        intBestTime = $scope.intChartData[i].time;
                        // intType = $scope.intChartData[i].type;
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

            updateGraph(repData, myRepGraph, intData, myIntGraph);
        });
    }
    $scope.workout = {
        name: "",
        id: "",
        eids: [],
        exercises: [],
        modified: false
    };

    // var iData = intData,
    //     iConfig = {
    //         data: iData,
    //         xkey: 'y',
    //         ykeys: intKeys,
    //         labels: ["Time"]
    //     };
    // iConfig.element = 'intGraph';
    // var myIntGraph = Morris.Line(iConfig);

    

    // function drawGraphs(repData, intData, intKeys) {

    // }

    function getWorkout() {
        var workoutID = $location.search().wid;
        $http({
            method: "GET",
            url: "/data/getWorkout?wid=" + workoutID
        }).then(function successCallback(response) {
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
            var curW = response.data.data;
            var exerciseArr = [];
            var eids = [];
            var repData = [];
            var intData = [];
            var intKeys = [];
            var jsonObj;
            for (var j = 0; j < curW.exercises.length; j++) {
                var curE = curW.exercises[j];
                jsonObj = {
                    name: curE.exercisename,
                    id: curE._id,
                    type: curE.exercisetype,
                    data: JSON.parse(curE.exercisedesc)
                };
                exerciseArr.push(jsonObj);
                eids.push(curE._id);
                getPerformanceData(curE.exercisename, curE._id, exerciseArr[j].data.sets, exerciseArr[j].type, repData, intData, myRepGraph, myIntGraph);
                console.log(repData);
            }
            for (var i = 0; i < exerciseArr.length; ++i) {
                var found = false;
                for (var j = 0; j < intKeys.length; ++j) {
                    if (exerciseArr[i].name == intKeys[j]) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    intKeys.push(exerciseArr[i].name);
                }
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

    angular.element(document).ready(getWorkout);

    
});

app.filter("reverse", function() {
    return function(items) {
        return items.slice().reverse();
    };
});
