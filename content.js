const REQUEST_URL = "https://oxygenrain.com/yourtime/timemarks.php?";

function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange =
    function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
}

// gets id of youtube video from url
// regex ignores "v=" to reuse on GET method
var id = window.location.href.match(/v=[^&]*/);

var htmltemplate = "";

fetch('template.html')
.then(response => response.text())
.then(text => htmltemplate=text);

document.getElementById("container").innerHTML += htmltemplate;

httpGetAsync(REQUEST_URL + id, function(rp){

    console.log(id + " done");
});
