var app = angular.module("history", []);

app.controller("historyCtrl", function($scope, $http, $location) {

    $scope.serverMsg = "";
    $scope.repHeaders = ["Date", "Type", "Sets", "Reps", "Weight"];
    $scope.intHeaders = ["Date", "Type", "Sets", "Time"];
    $scope.intChartData = [];
    $scope.repChartData = [];
    var intKeys = [];
    var intLabels = [];
    var repKeys = [];
    var repLabels = [];
    var repData = [];
    var intData = [];
    var myRepData = [];
    var myIntData = [];

    var workoutID = $location.search().wid;
    $http({
        method: "GET",
        url: "/data/getWorkout?wid=" + workoutID
    }).then(function successCallback(response1) {        
        var curW = response1.data.data;
        for (var i = 0; i < curW.exercises.length; i++) {
            var curE = curW.exercises[i];
            // console.log("curE");
            // console.log(curE);
            var found = false;
            if (curW.exercises[i].exercisetype == "Interval") {
                for (var j = 0; j < intKeys.length; ++j) {
                    if (curE._id == intKeys[j]) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    intKeys.push(curE._id);
                    intLabels.push(curE.exercisename);
                }
                // console.log(intKeys);
            }
            else  {
                for (var j = 0; j < repKeys.length; ++j) {
                    if (curE._id == repKeys[j]) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    repKeys.push(curE._id);
                    repLabels.push(curE.exercisename);
                }
            }
        }

        for (var i = 0; i < curW.exercises.length; i++) {
            var name = curW.exercises[i].exercisename;
            $http({
                method: "GET",
                url: "/data/getAllPerformances?wid=" + curW.exercises[i]._id
            }).then(function successCallback(response2) {
                var actualData = [];
                for (var j = 0; j < response2.data.data.length; j++) {
                    actualData.push(response2.data.data[j].exercise, JSON.parse(response2.data.data[j].pdata));
                }
            });
        }
        
        var iData = [];
        var iConfig = {
            data: iData,
            xkey: 'y',
            ykeys: intKeys,
            labels: intLabels,
            hideHover: "auto"
        };
        iConfig.element = 'intGraph';

        var rData = [];
        var rConfig = {
            data: rData,
            xkey: 'y',
            ykeys: repKeys,
            labels: repLabels,
            hideHover: "auto"
        }
        rConfig.element = 'repGraph';

        var myIntGraph = Morris.Line(iConfig);
        var myRepGraph = Morris.Line(rConfig);
        
        angular.element(document).ready(getWorkout(myIntGraph, myRepGraph));
    });

    function dataCollection(intNewData, repNewData) {
        for (var i = 0; i < intNewData.length; ++i) {
            myIntData.push(intNewData[i]);
        }
        for (var i = 0; i < repNewData.length; ++i) {
            myRepData.push(repNewData[i]);
        }
        // if (intNewData.length != 0) {
        //     document.getElementById("intGraphWhole").style.display = "";
        //     document.getElementById("intChartWhole").style.display = "";
        // }
        // else if (repNewData.length != 0) {
        //     document.getElementById("repGraphWhole").style.display = "";
        //     document.getElementById("repChartWhole").style.display = "";
        // }
    }

    function combineData(myIntData, myRepData, myIntGraph, myRepGraph) {
        var finalIntData = [];
        var myIntDataTmp = myIntData;
        var intDates = [];
        for (var i = 0; i < myIntData.length; ++i) {
            var found = false;
            for (var j = 0; j < intDates.length; ++j) {
                if (myIntData[i].y == intDates[j]) {
                    found = true;
                }
            }
            if (!found) {
                intDates.push(myIntData[i].y);
            }
        }
        console.log(intDates);
        // console.log(myIntData);

        for (var i = 0; i < intDates.length; ++i) {
            var tmp = new Object();
            tmp.y = intDates[i];
            for (var j = 0; j < myIntDataTmp.length; ++j) {
                if (intDates[i] == myIntDataTmp[j].y) {
                    for (var k = 0; k < intKeys.length; ++k) {
                        if (myIntDataTmp[j][intKeys[k]] != null) {
                            tmp[intKeys[k]] = myIntDataTmp[j][intKeys[k]];
                            console.log(intKeys[k]);
                            console.log(myIntDataTmp[j][intKeys[k]]);
                            // console.log(tmp[intKeys[k]]);
                        }
                    }
                }
            }
            console.log(tmp);
            // console.log(tmp);
            finalIntData.push(tmp);
            
        }
        // for (var i = 0, j = 1; j < myIntData.length - 1;) {
        //     var tmp = myIntData[i].y;
        //     // for (var j = 1; j < myIntData.length;) {
        //         var found = false;
        //         for (var k = 0; k < intKeys.length; ++k) {
        //             // console.log(tmp);
        //             // console.log(intString[j].y);
        //             if (tmp === myIntData[j].y && i != j) {
        //                 found = true;
        //                 // console.log(myIntData[i][intKeys[k]]);
        //                 if (finalIntData[i][intKeys[k]] == null) {
        //                     console.log(finalIntData[i][intKeys[k]]);
        //                     for (val in myIntData[j]) {
        //                         if (val == [intKeys[k]]) {
        //                             finalIntData[i][val] = myIntData[j][val];
        //                         }
        //                     }
        //                     // console.log(myIntData[j][intKeys[k]]);
        //                     // delete myIntData[i][intKeys[k]];
        //                     // var newTime = myIntData[j][intKeys[k]];
        //                     // console.log(newTime);
        //                     // myIntData[i][intKeys[k]] == newTime;
        //                     console.log(finalIntData[i]);
        //                 }
        //                 // console.log(myIntData[i]);
        //             }
        //         }
        //         if (found) {
        //             // var l = j;
        //             finalIntData.splice(j, 1);
        //             ++i;
        //             j = i + 1;
        //             // j = l + 1;
        //         }
        //         else {
        //             ++j;
        //         }
        //         // else {
        //         //     ++j;
        //         // }
        //     // }
        // }
        console.log("please");
        console.log(finalIntData);
        updateGraph(myRepData, myRepGraph, myIntData, myIntGraph);
    }

    function updateGraph(repData, myRepGraph, intData, myIntGraph) {
        myRepGraph.setData(repData);
        myIntGraph.setData(intData);
    }

    function getPerformanceData(exerciseName, exerciseID, exerciseSets, exerciseType, repData, intData, myRepGraph, myIntGraph, limit, itr) {
        $http({
            method: "GET",
            url: "/data/getAllPerformances?wid=" + exerciseID
        }).then(function successCallback(response) {
            var actualData = [];
            var intIDs = [];
            var repIDs = [];
            for (var i = 0; i < response.data.data.length; i++) {
                actualData.push(JSON.parse(response.data.data[i].pdata));
                if (exerciseType == "Interval") {
                    intIDs.push(exerciseID);
                }
                else {
                    repIDs.push(exerciseID);
                }
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
                            numdate: actualData[i].date,
                            id: intIDs[i]
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
                        if (minutes < 10) {
                            minutes = '0' + minutes;
                        }
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
                        console.log(minutes);
                        var repChartItem = {
                            type: exerciseName,
                            sets: exerciseSets,
                            reps: actualData[i].data[j].reps,
                            weight: actualData[i].data[j].weight,
                            date: month + ' ' + day + ', ' + year + ' ' + hours + ':' + minutes,
                            numdate: actualData[i].date,
                            id: repIDs[i]
                        };
                        $scope.repChartData.push(repChartItem);
                    }
                }
            }
            var intFormat = $scope.intChartData.length;
            var intString = [];
            if ($scope.intChartData.length != 0) {
                var intFirstDate = $scope.intChartData[0].numdate;
                var intBestTime = $scope.intChartData[0].time;
                var id = $scope.intChartData[0].id;
                
                for (var i = 1; i < intFormat; ++i) {
                    if (intFirstDate == $scope.intChartData[i].numdate) {
                        if (intBestTime < $scope.intChartData[i].time) {
                            intBestTime = $scope.intChartData[i].time;
                        }
                    }
                    else { 
                        var otherKeys = [];
                        for (var j = 0; j < intKeys.length; ++j) {
                            if (intKeys[j] != id) {
                                otherKeys.push(intKeys[j]);
                            }
                        }
                        var intObj = new Object();
                        intObj.y = intFirstDate;
                        intObj[id] = intBestTime;
                        
                        intString.push(intObj);
                        intFirstDate = $scope.intChartData[i].numdate;
                        intBestTime = $scope.intChartData[i].time;
                        id = $scope.intChartData[i].id;
                        // }
                    }
                }
                var intObj = new Object();
                intObj.y = intFirstDate;
                intObj[id] = intBestTime;

                intString.push(intObj);
                intData = intString;
            }

            var repFormat = $scope.repChartData.length;
            var repString = [];

            if ($scope.repChartData.length != 0) {
                var repFirstDate = $scope.repChartData[0].numdate;
                var repBestWeight = $scope.repChartData[0].weight;
                var id = $scope.repChartData[0].id;           

                for (var i = 1; i < repFormat; ++i) {
                    if (repFirstDate == $scope.repChartData[i].numdate) {
                        if (repBestWeight < $scope.repChartData[i].weight) {
                            repBestWeight = $scope.repChartData[i].weight;
                        }
                    }
                    else {
                        var otherKeys = [];
                        for (var j = 0; j < repKeys.length; ++j) {
                            if (repKeys[j] != id) {
                                otherKeys.push(repKeys[j]);
                            }
                        }
                        var repObj = new Object();
                        repObj.y = repFirstDate;
                        repObj[id] = repBestWeight;

                        repString.push(repObj);
                        repFirstDate = $scope.repChartData[i].numdate;
                        repBestWeight = $scope.repChartData[i].weight;
                        id = $scope.repChartData[i].id;
                    }
                }
                var repObj = new Object();
                repObj.y = repFirstDate;
                repObj[id] = repBestWeight;

                repString.push(repObj);
                repData = repString;
            }

            dataCollection(intData, repData);
            if (itr == limit - 1) {
                combineData(myIntData, myRepData, myIntGraph, myRepGraph);
            }
            // updateGraph(repData, myRepGraph, intData, myIntGraph, intKeys, repKeys);
        });
    }
    $scope.workout = {
        name: "",
        id: "",
        eids: [],
        exercises: [],
        modified: false
    };

    function getWorkout(myIntGraph, myRepGraph) {
        var workoutID = $location.search().wid;
        $http({
            method: "GET",
            url: "/data/getWorkout?wid=" + workoutID
        }).then(function successCallback(response) {
            // var myRepGraph = Morris.Line({
            //     element: "repGraph",
            //     data: repData,
            //     xkey: "y",
            //     ykeys: ["a"],
            //     labels: ["Weight"]
            // });
            // console.log(iConfig);

            

            // var myIntGraph = Morris.Line({
            //     element: "intGraph",
            //     data: intData,
            //     xkey: "y",
            //     ykeys: ["a"],
            //     labels: ["Time"]
            // });           
            var curW = response.data.data;
            var exerciseArr = [];
            var eids = [];
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
                getPerformanceData(curE.exercisename, curE._id, exerciseArr[j].data.sets, exerciseArr[j].type, repData, intData, myRepGraph, myIntGraph, curW.exercises.length, j);
                // console.log(repData);
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

    
});

app.filter("reverse", function() {
    return function(items) {
        return items.slice().reverse();
    };
});
