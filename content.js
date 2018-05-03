const SELECT_URL = "https://oxygenrain.com/yourtime/search.php?";
const INSERT_URL = "https://oxygenrain.com/yourtime/insert.php?";
const STYLESHEET_URL = document.getElementsByTagName('meta')['stylesheet-internal-url'].getAttribute('content');
var isLoaded = false;
// youtube's dynamic redirect refers to the tech yt uses to load the page when clicking a timemark on a comment or another video

function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange =
        function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                callback(xmlHttp.responseText);
        }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
}

// transforms seconds to (days):(hours):minutes:seconds
function SecondsToString(ss) {
    if (ss < 0) {
        return "negative time";
    }
    var dd = Math.floor(ss / (3600 * 24));
    ss -= dd * 3600 * 24;
    var hh = Math.floor(ss / 3600);
    ss -= hh * 3600;
    var mm = Math.floor(ss / 60);
    ss -= mm * 60;
    // These lines ensure you have two-digits
    if (dd < 10) {
        dd = "0" + dd;
    }
    if (hh < 10) {
        hh = "0" + hh;
    }
    if (mm < 10) {
        mm = "0" + mm;
    }
    if (ss < 10) {
        ss = "0" + ss;
    }
    var time = dd + ":" + hh + ":" + mm + ":" + ss;

    // removes unnecessary "00:"s, ignoring the last two for formatting
    return time.replace(/^(00\:){1,2}/gm, "");
}

// turns 1000 to 1k etc
// !TODO support >1 million
function readablizeNumber(number) {
    var s = ['', 'k', 'M'];
    var e = Math.floor(Math.log(number) / Math.log(1000));
    return (number / Math.pow(1000, e)) + s[e];
}

// parses and adds the response to the dom
function ProccessResponse(rp) {
    var statusCode = rp.split("|")[0];
    switch (statusCode) {
        case "404":
            NotFound();
            break;
        case "220": // response code 220 means the server has the data and was returned
            var response = JSON.parse(rp.substr(4));
            ResponseToDOM(response);
            break;
        case "210": //response code 210 means a seeder has the data
            // !TODO add webrtc support to enable p2p
            var response = JSON.parse(rp.substr(4));
            break;
        default:
            console.log("Invalid code status returned from server. Are you using the latest Your Time version?");
            break;
    }
}

function ResponseToDOM(array) {
    var stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = STYLESHEET_URL;

    var child = document.createElement("div");
    child.id = "your-time";
    document.getElementById("info").appendChild(child);
    // add stylesheet to the your-time div since i cant seem to add to head !TODO
    document.getElementById("your-time").appendChild(stylesheet);

    array.forEach(element => {
        // great dom manipulation
        var submission = document.createElement("div");
        var votes = document.createElement("div");
        var upvote = document.createElement("img");
        var number = document.createElement("span");
        var downvote = document.createElement("img");
        var seconds = document.createElement("a");
        var comment = document.createElement("span");

        submission.className = "submission";
        votes.className = "votes";
        upvote.className = "upvote";
        number.className = "number";
        downvote.className = "downvote";
        seconds.className = "seconds";
        comment.className = "comment";

        upvote.src = browser.extension.getURL("img/arrow_default_up-48x48.png");
        downvote.src = browser.extension.getURL("img/arrow_default_down-48x48.png");

        number.innerText = readablizeNumber(element["votes"]);
        seconds.innerText = SecondsToString(parseInt(element["time"]));
        seconds.href = "/watch?v=" + element["video"] + "&t=" + element["time"] + "s";
        seconds.rel = "nofollow";
        comment.innerText = element["comment"];

        votes.appendChild(upvote);
        votes.appendChild(number);
        votes.appendChild(downvote);

        submission.appendChild(votes);
        submission.appendChild(seconds);
        submission.appendChild(comment);

        child.appendChild(submission);
    });
}

function NotFound() {
    var stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    // TODO: add a meta tag containing the stylesheets' url
    stylesheet.href = STYLESHEET_URL;

    var child = document.createElement("div");
    child.id = "your-time";
    child.appendChild(stylesheet);

    var error = document.createElement("div");
    var mainText = document.createElement("span");
    var secondaryText = document.createElement("a");

    error.id = "error";
    mainText.className = "main-text";
    secondaryText.className = "secondary-text";

    secondaryText.onclick = AddTimemarkCreation;

    mainText.innerText = "Your Time didn't find any timemarks for this video.";
    secondaryText.innerText = "Submit your own.";

    error.appendChild(mainText);
    error.appendChild(secondaryText);

    child.appendChild(error);

    var intervalId;
    intervalId = setInterval(function () {
        // false if it has not loaded.
        if (document.getElementById("info-contents")) {
            console.log("Page loaded.");
            document.getElementById("info-contents").appendChild(child);
            console.log("Child appended.");
            clearInterval(intervalId);
        }
    }, 100);
}

// Overriding YouTube's saveAndPush function to add a event firer
var originalSaveAndPush = saveAndPush();

saveAndPush = function(arguments) {
    console.log("YESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS");
    return originalSaveAndPush(arguments);
}

var player = document.getElementById("movie_player");
player.addEventListener("onStateChange", function (statusInteger) {
    // https://developers.google.com/youtube/iframe_api_reference#Events
    console.log(statusInteger);
    switch (statusInteger) {
        case 1:
            if (!isLoaded) {
                console.log(statusInteger + " LOADING");
                RemoveOnError();
                main();
                isLoaded = true;
                console.log("LOADED");
            }
            break;
        case 5:
            RemoveOnError();
            main();
            isLoaded = true;
            console.log("LOADED");
            break;
    }
});

function RemoveOnError() {
    while (document.getElementById("your-time")) {
        document.getElementById("info-contents").removeChild(document.getElementById("your-time"));
    }
}

function AddTimemarkCreation() {
    alert("TODO:");
}

function main() {
    // gets id of youtube video from url
    var id = window.location.href.match(/v=[^&]*/);
    httpGetAsync(SELECT_URL + id, function (rp) {
        ProccessResponse(rp);
    });
}
