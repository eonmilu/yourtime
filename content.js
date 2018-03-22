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

// turns 1000 to 1k etc
// !TODO support >1 million
function readablizeNumber(number) {
    var s = ['', 'k', 'M'];
    var e = Math.floor(Math.log(number) / Math.log(1000));
    return (number / Math.pow(1000, e)) + s[e];
}

// parses and adds the response to the dom
function ResponseToHTML(response) {
    var stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = browser.extension.getURL("main.css");

    var child = document.createElement("div");
    child.id = "your-time";
    // add stylesheet to the your-time div since i cant add to the head !TODO

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
        seconds.href = "watch?v=" + element["video"] + "&t=" + element["time"] + "s";
        comment.innerText = element["comment"];

        votes.appendChild(upvote);
        votes.appendChild(number);
        votes.appendChild(downvote);

        submission.appendChild(votes);
        submission.appendChild(seconds);
        submission.appendChild(comment);

        child.appendChild(submission);
    });
    console.log(child);
    document.getElementById("info").appendChild(child);
    document.getElementById("your-time").appendChild(stylesheet);
}

// gets id of youtube video from url
// regex ignores "v=" to reuse on GET method
var id = window.location.href.match(/v=[^&]*/);

httpGetAsync(SELECT_URL + id, function(rp) {
    // if its not empty meaning there is data
    if (rp!="[]") {
        var response = JSON.parse(rp);
        // !TODO fix youtubes dynamic redirects
        ResponseToHTML(response);
    } else {

    }
});

// !TODO add event for youtube's non-refresh url changes using history.pushState
