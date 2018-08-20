const META_ELEMENT_INTERVAL = 10;

var intervalId;
intervalId = setInterval(function () {
    if ($("meta[name='your-time-token-local'").length) {
        clearInterval(intervalId);
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
