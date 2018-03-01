// this is called from content.js as a workaround
// to content scripts not being allowed
// to do cross-domain requests.

const REQUEST_URL = "http://oxygenrain.com/clickbait/timemarks.php?";

function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        // var i = 0;
        // while(i < 10)
        {
            // console.log("------------- Attempt " + i + "----------------");
            // i++;
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

browser.runtime.onMessage.addListener(notify);

function notify(message) {

}
