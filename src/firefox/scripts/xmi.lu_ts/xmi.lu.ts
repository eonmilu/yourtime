declare var browser: any;
const MetaElementInterval = 10;

const IntervailIDToken = setInterval(function () {
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
                clearInterval(IntervailIDToken);
                $("meta[name='your-time-token-local'").remove();
            },
            error => {
                console.log(error);
            });
    }
}, MetaElementInterval);

const IntervalIDRemove = setInterval(function () {
    if ($("meta[name='your-time-token-local-remove'").length) {
        browser.storage.local.remove("yourtimeauth").then(
            () => {
                console.log("Storage removed")
                clearInterval(IntervalIDRemove);
                $("meta[name='your-time-token-local-remove'").remove();
            },
            error => {
                console.log(error)
            });
    }
}, MetaElementInterval);
