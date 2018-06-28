// This meta element contains the stylesheet, upvote and downvote images' internal url
// so that the injected script can access them since it cannot use the browser's APIs
var metaSources = {
    stylesheet: browser.extension.getURL("stylesheet.css"),
    loader: browser.extension.getURL("loader.svg")
}

var script = document.createElement("script");
script.src = browser.extension.getURL("content.js");

var loader = document.createElement("img");
loader.src = browser.extension.getURL("loader.svg");
loader.alt = "Loading...";
loader.id = "your-time-loader";
loader.height = 45, loader.width = 65;
loader.style = "display: block; margin: auto;"

var meta = document.createElement('meta');
meta.name = "your-time-meta";
meta.content = JSON.stringify(metaSources);

var intervalId;
intervalId = setInterval(function () {
    console.log("Searching for target div...");

    // false if it has not loaded.
    if (document.getElementById("info-contents")) {
        console.log("Found target div. Adding script...");

        document.getElementById("info-contents").appendChild(loader);
        (document.head || document.documentElement).appendChild(meta);
        (document.head || document.documentElement).appendChild(script);

        clearInterval(intervalId);
    }
}, 10);
