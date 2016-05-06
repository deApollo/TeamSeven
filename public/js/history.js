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
    //gets the workout
    $http({
        method: "GET",
        url: "/data/getWorkout?wid=" + workoutID
    }).then(function successCallback(response1) {        
        var curW = response1.data.data;
        //for each exercise in the workout
        for (var i = 0; i < curW.exercises.length; i++) {
            var curE = curW.exercises[i];
            var found = false;
            //if it's an interval workout
            if (curW.exercises[i].exercisetype == "Interval") {
                //populate the keys and labels for the graph
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
            }
            //if it's a rep workout
            else  {
                //populate the keys and labels for the graph
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
        //for every exercise
        for (var i = 0; i < curW.exercises.length; i++) {
            var name = curW.exercises[i].exercisename;
            //get the performance data for each exercise
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
        
        //configuration for interval graph
        var iData = [];
        var iConfig = {
            data: iData,
            xkey: 'y',
            ykeys: intKeys,
            labels: intLabels,
            hideHover: "always"
        };

        iConfig.element = 'intGraph';

        //configuration for rep graph
        var rData = [];
        var rConfig = {
            data: rData,
            xkey: 'y',
            ykeys: repKeys,
            labels: repLabels,
            hideHover: "always"
        }

        rConfig.element = 'repGraph';

        //creates the graphs
        var myIntGraph = Morris.Line(iConfig);
        var myRepGraph = Morris.Line(rConfig);
        
        angular.element(document).ready(getWorkout(myIntGraph, myRepGraph));
    });

    function dataCollection(intNewData, repNewData) {
        //pushes all of the performance data for each interval exercise into one array
        for (var i = 0; i < intNewData.length; ++i) {
            myIntData.push(intNewData[i]);
        }
        //pushes all of the performance data for each rep exercise into one array
        for (var i = 0; i < repNewData.length; ++i) {
            myRepData.push(repNewData[i]);
        }
    }

    function updateGraph(repData, myRepGraph, intData, myIntGraph) {
        //puts the data into both graphs
        myRepGraph.setData(repData);
        myIntGraph.setData(intData);
    }

    function getPerformanceData(exerciseName, exerciseID, exerciseSets, exerciseType, repData, intData, myRepGraph, myIntGraph, limit, itr) {
        //get the performance data for each exercise
        $http({
            method: "GET",
            url: "/data/getAllPerformances?wid=" + exerciseID
        }).then(function successCallback(response) {
            var actualData = [];
            var intIDs = [];
            var repIDs = [];
            for (var i = 0; i < response.data.data.length; i++) {
                actualData.push(JSON.parse(response.data.data[i].pdata));
                //gathers the exercise ids for interval exercises
                if (exerciseType == "Interval") {
                    intIDs.push(exerciseID);
                }
                //gathers the exercise ids for rep exercises
                else {
                    repIDs.push(exerciseID);
                }
            }
            if (exerciseType == "Interval") {
                for (var i = 0; i < actualData.length; ++i) {
                    for (var j = 0; j < exerciseSets; ++j) {
                        //creates objects for the graph and charts for each performance
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
                        //creates objects for the graph and charts for each performance
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
                
                //finds the best time for each specific performance (by looking at their dates)
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
                    }
                }
                var intObj = new Object();
                intObj.y = intFirstDate;
                intObj[id] = intBestTime;

                intString.push(intObj);
                //this is the data for the interval graph
                intData = intString;
            }

            var repFormat = $scope.repChartData.length;
            var repString = [];

            if ($scope.repChartData.length != 0) {
                var repFirstDate = $scope.repChartData[0].numdate;
                var repBestWeight = $scope.repChartData[0].weight;
                var id = $scope.repChartData[0].id;           

                for (var i = 1; i < repFormat; ++i) {
                    //finds the best weight lifted for each specific performance (by looking at their dates)
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
                //this is the data for the rep graph
                repData = repString;
            }

            //gathers all of the data into one array
            dataCollection(intData, repData);
            //once we're done gathering all of the performance data, put it into the charts and graphs
            if (itr == limit - 1) {
                updateGraph(myRepData, myRepGraph, myIntData, myIntGraph);
            }
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
        //gets the workout
        $http({
            method: "GET",
            url: "/data/getWorkout?wid=" + workoutID
        }).then(function successCallback(response) {      
            var curW = response.data.data;
            var exerciseArr = [];
            var eids = [];
            var intKeys = [];
            var jsonObj;
            //for each exercise in the workout
            for (var j = 0; j < curW.exercises.length; j++) {
                var curE = curW.exercises[j];
                //grab all of the necessary information of each exercise
                jsonObj = {
                    name: curE.exercisename,
                    id: curE._id,
                    type: curE.exercisetype,
                    data: JSON.parse(curE.exercisedesc)
                };
                exerciseArr.push(jsonObj);
                eids.push(curE._id);
                //get the performance data for each exercise
                getPerformanceData(curE.exercisename, curE._id, exerciseArr[j].data.sets, exerciseArr[j].type, repData, intData, myRepGraph, myIntGraph, curW.exercises.length, j);
            }
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
