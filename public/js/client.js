function writeActivities(){
    $.ajax({
        dataType: "json",
        url: "data/getActivities",
        method: 'GET',
        success: writeActivitiesCallback
    });
}

function writeActivitiesCallback(data){
    $("#activityList").html("");
    for(var i = 0; i < data.length; i++){
        var curEntry = data[i];
        var activityName = curEntry["actname"];
        var activityDesc = curEntry["actdesc"];
        $("#activityList").append("<li id='actUID-"+i+"-"+activityName+"'><h3>"+activityName+"</h3><p>"+activityDesc+"</p></li>");
    }
    $("#activityList li").click(removeActivity);
}

function addActivity(){
    var actName = $("#activityName").val();
    var actDesc = $("#activityDesc").val();
    $.ajax({
        dataType: "json",
        url: "data/addActivity",
        method: 'POST',
        data: {activityName : actName, activityDesc : actDesc},
        success: addActivityCallback
    });
}

function addActivityCallback(data){
    writeActivities();
    $("#output").html(data);
}

function removeActivity(){
    var elementUID = $(this).attr('id');
    var actName = elementUID.split("-",3)[2];
    $.ajax({
        dataType: "json",
        url: "data/removeActivity",
        method: 'POST',
        data: {activityName : actName},
        success: removeActivityCallback
    });
}

function removeActivityCallback(data){
    alert("activity removed!");
    writeActivities();
}

$(document).ready(function(){
    writeActivities();
    $("#addActButton").click(addActivity);
});
