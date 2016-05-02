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
    $scope.repHeaders = ["Date", "Type", "Sets", "Reps", "Weight"];
    $scope.intHeaders = ["Date", "Type", "Sets", "Time"];
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
                        var d = new Date(actualData[i].date);
                        var month = '' + (d.getMonth() + 1);
                        var day = '' + d.getDate();
                        var year = d.getFullYear();
                        var hours = d.getHours();
                        var minutes = d.getMinutes();
                        var seconds = d.getSeconds();
                        if (month.length < 2) month = '0' + month;
                        if (day.length < 2) day = '0' + day;
                        var intChartItem = {
                            type: exerciseName,
                            sets: exerciseSets,
                            time: actualData[i].data[j].time,
                            date: [hours, minutes, seconds].join(':') + " " + [month, day, year].join('-') 
                            // instance: i
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
                        var d = new Date(actualData[i].date);
                        var month = '' + (d.getMonth() + 1);
                        var day = '' + d.getDate();
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
                            date: [hours, minutes, seconds].join(':') + " " + [month, day, year].join('-')
                        };
                        $scope.repChartData.push(repChartItem);
                    }
                }
            }
            console.log("HERE'S WHAT WE GOT FOR INTS");
            console.log($scope.intChartData);

            var intFormat = $scope.intChartData.length;
            // var setNum = 0;
            // for (var i = 0; i < intFormat; ++i) {
            //     if ($scope.intChartData[i].instance > setNum) {
            //         setNum = $scope.intChartData[i].instance;
            //     }
            // }
            // console.log("SETNUM");
            // console.log(setNum);
            var intString = [];
            var setNum = [];
            var firstDate = $scope.intChartData[0].date;
            // var firstInstance = $scope.intChartData[0].instance;
            var bestDate = $scope.intChartData[0].date;
            var bestTime = $scope.intChartData[0].time;
            var i = 0;
            var dateSort = [];
            var totalDates = []
            for (var i = 0; i < intFormat; ++i) {
                if (firstDate == $scope.intChartData[i].date) {
                    dateSort.push($scope.intChartData[i]);
                }
                else {
                    firstDate = $scope.intChartData[i].date;
                    totalDates.push(dateSort);
                    dateSort = [];
                }
            }

            console.log("TOTALDATES");
            console.log(totalDates);

            for (var i = 1; i < intFormat; ++i) {
                console.log(firstDate);
                if (firstDate == $scope.intChartData[i].date) {
                    var intDate = $scope.intChartData[i].date;
                    var intTime = $scope.intChartData[i].time;
                    if (intTime > bestTime) {
                        bestTime = intTime;
                    }
                }
                else {
                    intString.push({y: firstDate, a: bestTime});
                    bestTime = $scope.intChartData[i].time;
                }
                firstDate = $scope.intChartData[i-1].date;
            }
            // var count = (intFormat / exerciseSets);
            // console.log(count);

            // for (var i = 0; i < exerciseSets; ++i) {

            // }
            // for (var i = 1; i < intFormat; ++i) {
            //     if (firstDate == $scope.intChartData[i].date) {
            //         count++;
            //     }
            //     else {
            //         setNum.push(count);
            //         count = 1;
            //     }
            // }
            // console.log("SETNUM ARRAY");
            // console.log(setNum);
            //     // console.log(lastDate);
            //     while (firstDate == $scope.intChartData[i].date) {
            //         var intDate = $scope.intChartData[i].date;
            //         var intType = $scope.intChartData[i].type;
            //         var intTime = $scope.intChartData[i].time;
            //         if (intTime > bestTime) {
            //             bestTime = intTime;
            //             bestDate = intDate;
            //         }
            //         // if (lastDate != intDate) {
            //             intString.push({y: bestDate, a: bestTime});
            //             bestTime = 0;
            //             // lastDate = intDate;
            //         // }
            //         // lastDate = intDate;
            //     }
            // }
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