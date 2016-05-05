function handleUpdateSuccess(response) {
    $("#response").append(response);
    location.reload();
}

function handleUpdateFailure(response) {
    $("#response").append(response);
    location.reload();
}

/**
 * Function used to update a given user preference field
 *
 * Makes a POST request to the backend change user preference endpoint
 *
 * @param {string} fieldname
 *   The user preference field name
 * @param {string} fieldval
 *   The user preference field value
 */
function updateField(fieldname, fieldval) {
    $.ajax({
        url: "data/changeUserPreference",
        method: "POST",
        data: {
            "field": fieldname,
            "value": fieldval
        },
        success: handleUpdateSuccess,
        failure: handleUpdateFailure
    });
}

/**
 * Function used to upload a users new profile picture
 *
 * Makes a POST request to the backend change user picture endpoint
 *
 * @param {picture} picture
 *   The picture object
 */
function updatePicture(picture) {
    var fd = new FormData();
    fd.append("avatar", picture);
    $.ajax({
        url: "data/changeUserPicture",
        data : fd,
        processData: false,
        contentType: false,
        type: "POST",
        success: handleUpdateSuccess,
        failure: handleUpdateFailure
    });
}

var curVal;

/**
 * Legacy jquery code please forgive me ;_;
 */
$(document).ready(function() {
    curVal = $("input:radio[name='optionsRadios']").val();
    $("#submitButton").click(function() {
        var formRes = {};
        formRes["firstname"] = $("#firstname").val();
        formRes["lastname"] = $("#lastname").val();
        formRes["email"] = $("#email").val();
        if(curVal != $("input:radio[name='optionsRadios']").val())
            formRes["preferred_units"] = $("input:radio[name='optionsRadios']").val();
        formRes["picture"] = $("#avatar").val();
        for (var key in formRes) {
            if (formRes.hasOwnProperty(key)) {
                if (formRes[key]) {
                    if(key == "picture")
                        updatePicture( $("#avatar").prop("files")[0]);
                    else
                        updateField(key, formRes[key]);
                }
            }
        }
    });
});
