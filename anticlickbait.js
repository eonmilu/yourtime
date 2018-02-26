const REQUEST_URL = "http://oxygenrain.com/anticlickbait/timemarks.php?";

// generic error handler
function onError(error){
    console.log(error);
}

function GetVideoID(){
    // gets id of youtube video from url
    // regex ignores "v=" to reuse on GET method
    return window.location.href.match(/((v=)([^&]*))/);
}

// https://stackoverflow.com/a/22076667/8774937
var HttpClient = function() {
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() {
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }

        anHttpRequest.open( "GET", aUrl, true );
        anHttpRequest.send( null );
    }
}

let response = "";
console.log("Working with: " + GetVideoID()[0]);
var client = new HttpClient();
client.get(REQUEST_URL + GetVideoID(), function(responseText){
    // sets parsed to global variable
    response = responseText;
});

document.getElementById("count").innerHTML = "response: " + response;
