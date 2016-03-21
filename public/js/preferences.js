function handleUpdateSuccess(response){
    $("#response").append(response);
}

function handleUpdateFailure(response){
    $("#response").append(response);
}

function updateField(fieldname, fieldval){
    $.ajax({
        url: "data/changeUserPreference",
        method: "POST",
        data : {'field' : fieldname, 'value' : fieldval},
        success: handleUpdateSuccess,
        failure: handleUpdateFailure
    });
}


$(document).ready(function(){
    $("#submitButton").click(function(){
        var formRes = {};
        formRes['firstname'] = $("#firstname").val();
        formRes['lastname'] = $("#lastname").val();
        formRes['email'] = $("#email").val();
        formRes['preferred_units'] = $("input:radio[name='optionsRadios']").val();
        for(var key in formRes){
            if(formRes.hasOwnProperty(key)){
                if(formRes[key]){
                    updateField(key,formRes[key]);
                }
            }
        }
    });
});
