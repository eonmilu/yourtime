const META_ELEMENT_INTERVAL = 10;

var intervalIdGet;
intervalId = setInterval(function () {
    if ($("meta[name='your-time-token-local'").length) {
        clearInterval(intervalIdGet);
        const credentials = JSON.parse($("meta[name='your-time-token-local'")
            .attr("content"));
        browser.storage.local.set({
            yourtimeauth: {
                username: credentials.username,
                token: credentials.token
            }
        })
    }
}, META_ELEMENT_INTERVAL);

var intervalIdRemove;
intervalId = setInterval(function () {
    if ($("meta[name='your-time-token-local-remove'").length) {
        clearInterval(intervalIdRemove);
        browser.storage.local.remove("yourtimeauth").then(
            () => { },
            error => {
                console.log(error)
            });
    }
}, META_ELEMENT_INTERVAL);
