const SELECT_URL = "https://oxygenrain.com/yourtime/select.php?";
const INSERT_URL = "https://oxygenrain.com/yourtime/insert.php?";

function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange =
    function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
}

// transforms seconds to (days):(hours):minutes:seconds
function SecondsToString(ss) {
    if (ss<0) { return "negative time";}
    var dd = Math.floor(ss / (3600*24));
    ss  -= dd*3600*24;
    var hh   = Math.floor(ss / 3600);
    ss  -= hh*3600;
    var mm = Math.floor(ss / 60);
    ss  -= mm*60;
    // These lines ensure you have two-digits
    if (dd < 10) {dd = "0"+dd;}
    if (hh < 10) {hh = "0"+hh;}
    if (mm < 10) {mm = "0"+mm;}
    if (ss < 10) {ss = "0"+ss;}
    var time = dd+":"+hh+":"+mm+":"+ss;

    // removes unnecessary "00:"s, ignoring the last two for formatting
    return time.replace(/^(00\:){1,2}/gm, "");
}

// encodes the response as html
function ResponseToHTML(response) {
    var html = "<div id=\"your-time\">";
    response.forEach(element => {
        html += "<div class=\"submission\">";
            html += "<h3 class=\"seconds\">" + SecondsToString(element["time"]) + "</h3>";
            html += "<h3 class=\"comment\">" + element["comment"]               + "</h3>";
            html += "<h3 class=\"votes\">"   + element["votes"]                 + "</h3>";
        html += "</div>";
    });
    html += "</div>";
}

// gets id of youtube video from url
// regex ignores "v=" to reuse on GET method
var id = window.location.href.match(/v=[^&]*/);

httpGetAsync(SELECT_URL + id, function(rp) {
    // if its not empty meaning there is data
    if (rp!="[]") {
        var response = JSON.parse(rp);
        var html = ResponseToHTML(response);
        console.log(html);
        document.getElementById("info-contents").innerHTML += html;
    }
});
