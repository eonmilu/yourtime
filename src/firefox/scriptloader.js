var s = document.createElement("script");
s.src = browser.extension.getURL("content.js");

var metaSources = {
    stylesheet: browser.extension.getURL("stylesheet.css"),
}

// This meta element contains the stylesheet, upvote and downvote images' internal url
// so that the injected script can access them since it cannot use the browser's APIs
var meta = document.createElement('meta');
meta.name = "your-time-meta";
meta.content = JSON.stringify(metaSources);

var intervalId;
intervalId = setInterval(function () {
    console.log("Searching for target div...");

    // false if it has not loaded.
    if (document.getElementById("info-contents")) {
        console.log("Found target div. Adding script...");

        (document.head || document.documentElement).appendChild(meta);
        (document.head || document.documentElement).appendChild(s);

        clearInterval(intervalId);
    }
}, 100);
