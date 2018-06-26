const SELECT_URL = "https://oxygenrain.com/yourtime/search.php?";
const INSERT_URL = "https://oxygenrain.com/yourtime/insert.php?";
const META = JSON.parse(document.getElementsByTagName('meta')['your-time-meta'].getAttribute('content'));
var lastId = "";

function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange =
        function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                callback(xmlHttp.responseText);
        };
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
}

// Transform seconds to ((days):(hours):)minutes:seconds
function secondsToString(ss) {
    // Ignore negative seconds
    if (ss < 0) return Global.NaN;

    var dd = Math.floor(ss / (3600 * 24));
    ss -= dd * 3600 * 24;
    var hh = Math.floor(ss / 3600);
    ss -= hh * 3600;
    var mm = Math.floor(ss / 60);
    ss -= mm * 60;

    // Ensure two-digits
    if (dd < 10)
        dd = "0" + dd;
    if (hh < 10)
        hh = "0" + hh;
    if (mm < 10)
        mm = "0" + mm;
    if (ss < 10)
        ss = "0" + ss;

    var time = dd + ":" + hh + ":" + mm + ":" + ss;

    // Remove unnecessary "00:"s, ignoring the last two for formatting
    return time.replace(/^(00\:){1,2}/gm, "");
}

// Make numbers human-readable
function readablizeNumber(number) {
    // TODO:: support >1 million
    var s = ['', 'k', 'M'];
    var e = Math.floor(Math.log(number) / Math.log(1000));
    return (number / Math.pow(1000, e)) + s[e];
}

// Add main skeleton, where the children will be added
function addMainStructure() {
    var stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet", stylesheet.href = META.stylesheet;

    var mainStructure = document.createElement("div");
    mainStructure.appendChild(stylesheet);
    mainStructure.id = "your-time";

    document.getElementById("info-contents").appendChild(mainStructure);
}

function appendChildToMainStructure(mainStructure, childData) {
    var submission = document.createElement("div");
    var votes      = document.createElement("div");
    var upvote     = document.createElement("svg");
    var number     = document.createElement("span");
    var downvote   = document.createElement("svg");
    var seconds    = document.createElement("a");
    var comment    = document.createElement("span");
    var triangle   = document.createElement("polygon");

    submission.className = "submission";
    votes.className      = "votes";
    upvote.className     = "upvote";
    number.className     = "number";
    downvote.className   = "downvote";
    seconds.className    = "seconds";
    comment.className    = "comment";

    triangle.points = "14,0 7,14 0,0";
    triangle.style = "fill:gray;";

    upvote.height = "50%", upvote.width = "14";
    upvote.appendChild(triangle);

    downvote.height = "50%", downvote.width = "14";
    upvote.appendChild(triangle);

    number.innerText = readablizeNumber(childData["votes"]);
    seconds.innerText = secondsToString(parseInt(childData["time"]));
    seconds.addEventListener('click', function(){
        player.seekTo(childData["time"]);
    });
    seconds.rel = "nofollow";
    comment.innerText = childData["comment"];

    votes.appendChild(upvote);
    votes.appendChild(number);
    votes.appendChild(downvote);

    submission.appendChild(votes);
    submission.appendChild(seconds);
    submission.appendChild(comment);

    mainStructure.appendChild(submission);
}

// Parse and add the response to the DOM
function processResponse(rp, statusCode) {
    var mainStructure = document.getElementById("your-time");

    switch (statusCode) {
        case "220": // 220 for data returned
            var response = JSON.parse(rp);
            response.forEach(element => {
                appendChildToMainStructure(mainStructure, element);
            });
            break;
        case "404":
        default:
            var error         = document.createElement("div"),
                mainText      = document.createElement("span"),
                secondaryText = document.createElement("a");

            error.id                = "error";
            mainText.className      = "main-text";
            mainText.innerText      = "Your Time didn't find any timemarks for this video. ";
            secondaryText.className = "secondary-text";
            secondaryText.onclick   = addTimemark;
            secondaryText.innerText = "Submit your own.";

            error.appendChild(mainText);
            error.appendChild(secondaryText);
            mainStructure.appendChild(error);

            document.getElementById("info-contents").appendChild(mainStructure);
    }
}

function removeMainStructure() {
    while (document.getElementById("your-time")) {
        document.getElementById("info-contents").removeChild(document.getElementById("your-time"));
    }
}

function addTimemark() {
    alert("TODO:");
}

// Get ID of YouTube video from URL
var id = window.location.href.match(/v=[^&]*/)[0];
lastId = "";
console.log(lastId);

var player = document.getElementById("movie_player");
player.addEventListener("onStateChange", function (statusInteger) {
    // https://developers.google.com/youtube/iframe_api_reference#Events
    // Normally we would use -1 or 5 but YouTube's API is unreliable
    // Therefore we will use 1 (playing) and check if the data has already been loaded
    console.log(statusInteger);
    id = window.location.href.match(/v=[^&]*/)[0];
    switch (statusInteger) {
        case 1:
            if (lastId != id) {
                lastId = id;
                removeMainStructure();
                main();
            }
            break;
    }
});

// TEMP: Make sure the pause/play event is fired
player.pauseVideo();
player.playVideo();

function main() {
    httpGetAsync(SELECT_URL + id, function (rp) {
        var statusCode = rp.split("|")[0];
        var response = rp.substr(4);

        addMainStructure();
        processResponse(response, statusCode);
    });
}
