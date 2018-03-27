const SELECT_URL = "https://oxygenrain.com/yourtime/search.php?";
const INSERT_URL = "https://oxygenrain.com/yourtime/insert.php?";

// youtube's dynamic redirect refer to the tech yt
// uses not to load the page when clicking a timemark
// on a comment or another video

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
function ResponseToHTML(rp) {
    var statusCode = rp.split("|")[0];
    switch (statusCode) {
        case "404":
            OnNotFound();
            break;
        case "220": // response code 220 means the server has the data and was returned
            var response = JSON.parse(rp.substr(4));
            AddParsedResponseToDOM(response);
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

function AddParsedResponseToDOM(array) {
    var stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = browser.extension.getURL("response.css");

    var child = document.createElement("div");
    child.id = "your-time";
    document.getElementById("info").appendChild(child);
    // add stylesheet to the your-time div since i cant seem to add to head !TODO
    document.getElementById("your-time").appendChild(stylesheet);

    response.forEach(element => {
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

function OnNotFound() {
    var stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = browser.extension.getURL("notfound.css");

    var child = document.createElement("div");
    child.id = "your-time";
    // add stylesheet to the your-time div since i cant seem to add to head !TODO
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
    document.getElementById("info").appendChild(child);
}

// resets everything to cope with youtube's dynamic link directing
function Reset() {
    document.getElementById("info").removeChild(document.getElementById("your-time"));
}

function AddTimemarkCreation() {
    document.getElementById("your-time").innerHTML = "heck you";
}
main();

// gets id of youtube video from url
// regex ignores "v=" to reuse on GET method
function main() {
    var id = window.location.href.match(/v=[^&]*/);

    httpGetAsync(SELECT_URL + id, function (rp) {
        ResponseToHTML(rp);
    });
}
// !TODO add event for youtube's non-refresh url changes using history.onpushState
// !TODO add support for youtube's dynamic link redirecting
