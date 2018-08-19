const META_ELEMENT_INTERVAL = 10;

var intervalId;
intervalId = setInterval(function () {
    if ($("meta[name='your-time-token-local'").length) {
        browser.storage.set({
            yourtimeAuth: {
                
            }
        })
        clearInterval(intervalId);
    }
}, META_ELEMENT_INTERVAL);
