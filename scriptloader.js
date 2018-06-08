var s = document.createElement("script");
s.src = browser.extension.getURL("content.js");

// This meta element contains the stylesheets' internal url so that the injected script
// can access it since it cannot use the browser's APIs
var meta = document.createElement('meta');
meta.name = "stylesheet-internal-url";
// TODO: unify the stylesheet
meta.content = browser.extension.getURL("stylesheet.css");

var intervalId;
intervalId = setInterval(function () {
    console.log("Searching for target div..");

    // false if it has not loaded.
    if (document.getElementById("info-contents")) {
        console.log("Found target div. Adding script...");

        (document.head || document.documentElement).appendChild(meta);
        (document.head || document.documentElement).appendChild(s);

        clearInterval(intervalId);
    }
}, 100);
