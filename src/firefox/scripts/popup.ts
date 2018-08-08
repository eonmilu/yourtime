$("<script/>", {src: browser.extension.getURL("scripts/platform.js")}).appendTo("head");
document.getElementsByTagName("body")[0].innerText = "Hello there!";
