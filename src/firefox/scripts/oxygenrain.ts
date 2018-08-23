const META_ELEMENT_INTERVAL = 10;

var intervalIdGet;
intervalId = setInterval(function () {
    if ($("meta[name='your-time-token-local'").length) {
        const credentials = JSON.parse($("meta[name='your-time-token-local'")
            .attr("content"));
        browser.storage.local.set({
            yourtimeauth: {
                username: credentials.username,
                token: credentials.token
            }
        });

        clearInterval(intervalIdGet);
        $("meta[name='your-time-token-local'").remove();
    }
}, META_ELEMENT_INTERVAL);

var intervalIdRemove;
intervalId = setInterval(function () {
    if ($("meta[name='your-time-token-local-remove'").length) {
        browser.storage.local.remove("yourtimeauth").then(
            () => {
                console.log("Storage removed")
            },
            error => {
                console.log(error)
            });
        clearInterval(intervalIdRemove);
        $("meta[name='your-time-token-local-remove'").remove();
    }
}, META_ELEMENT_INTERVAL);
