const META_ELEMENT_INTERVAL = 10;

const intervailIDToken = setInterval(function () {
    if ($("meta[name='your-time-token-local'").length) {
        const credentials = JSON.parse($("meta[name='your-time-token-local'")
            .attr("content"));
        browser.storage.local.set({
            yourtimeauth: {
                username: credentials.username,
                token: credentials.token
            }
        }).then(
            () => {
                clearInterval(intervailIDToken);
                $("meta[name='your-time-token-local'").remove();
            },
            error => {
                console.log(error);
            });
    }
}, META_ELEMENT_INTERVAL);

const intervalIDRemove = setInterval(function () {
    if ($("meta[name='your-time-token-local-remove'").length) {
        browser.storage.local.remove("yourtimeauth").then(
            () => {
                console.log("Storage removed")
                clearInterval(intervalIDRemove);
                $("meta[name='your-time-token-local-remove'").remove();
            },
            error => {
                console.log(error)
            });
    }
}, META_ELEMENT_INTERVAL);
