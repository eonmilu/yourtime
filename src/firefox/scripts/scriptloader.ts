declare var browser: any;
// This meta element contains the stylesheet, upvote and downvote images' internal url
// so that the injected script can access them since it cannot use the browser's APIs
var metaSources = {
    stylesheet: browser.extension.getURL("../resources/stylesheet.css"),
    loader: browser.extension.getURL("../resources/loader.svg")
}

// Load jQuery as soon as possible
$("<script/>", { src: browser.extension.getURL("scripts/jquery.min.js") }).appendTo("head");

let script = $("<script/>", { src: browser.extension.getURL("scripts/content.js") });
let loader = $("<img/>", {
    src: browser.extension.getURL("../resources/loader.svg"),
    alt: "Loading...",
    id: "your-time-loader",
    height: "45px", width: "65px",
    style: "display: block; margin: auto;"
});

let meta = $("<meta/>", {
    name: "your-time-meta",
    content: JSON.stringify(metaSources)
});

// Check every 10 ms if the div has been loaded
var intervalId;
intervalId = setInterval(() => {
    console.log("Searching for target div...");

    // false if it has not loaded.
    if ($("#info-contents").length) {
        console.log("Found target div. Adding script...");

        $("#info-contents").append(loader);
        $("head").append(meta, script);
        clearInterval(intervalId);
    }
}, 10);
