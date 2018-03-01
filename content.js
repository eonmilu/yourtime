const REQUEST_URL = "http://oxygenrain.com/clickbait/timemarks.php?";

// generic error handler
function onError(error){
    console.log(error);
}

function GetVideoID(){
    // gets id of youtube video from url
    // regex ignores "v=" to reuse on GET method
    return window.location.href.match(/v=[^&]*/);
}

var id = GetVideoID()[0];
console.log("Working with: " + id);

function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        var i = 0;
        while(i < 10)
        {
            console.log("------------- Attempt " + i + "----------------");
            i++;
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
                console.log("all ok, breaking");
                callback(xmlHttp.responseText);
                break;
            } else {
                console.log("ERROR: \n\tready state: "+ xmlHttp.readyState + ", status: " + xmlHttp.status)
            }
        }
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    console.log("sending");
    xmlHttp.send(null);
}

console.log("asking for" + REQUEST_URL+id)
httpGetAsync(REQUEST_URL+id, function(rp){
    console.log("done");
    document.getElementById("count").innerHTML = rp;
});
