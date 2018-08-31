appendLoader();

var lastId = "";
var videoID = getCurrentVideoID();
// Must use document.getElementById, otherwise the API will not work
const player: any = document.getElementById("movie_player");
player.addEventListener("onStateChange", (statusInteger: Number) => {
	// https://developers.google.com/youtube/iframe_api_reference#Events
	// The UNSTARTED or CUED status should be used.
	// However, YouTube's IFrame Player API is unreliable,
	// so we shall use PLAYING and check if the timemarks have been loaded
	videoID = getCurrentVideoID();
	if (statusInteger == PLAYING && lastId != videoID) {
		lastId = videoID;
		loaderIcon.appendTo($("#info-contents"));
		onLayoutLoaded();
	}
});

ensureStateChange();

function getCurrentVideoID(): string {
	const id = window.location.href.match(/v=([^&]*)/)[1];
	return id;
}

function ensureStateChange() {
	// HACK: Make sure the pause/play event is fired
	player.pauseVideo();
	player.playVideo();
}

function changeServerVotes(action: string, id: string) {
	$.ajax({
		method: "POST",
		url: VOTES_URL,
		data: {
			id: id,
			action: action
		},
		timeout: DEFAULT_TIMEOUT
	}).done(function () {
		console.log("Sent vote");
	});
}

// Parse and add the response to the DOM
function processResponse(statusCode: string, rawResponse: string): void {
	if (statusCode == STATUS_CODE.FOUND) {
		const response = JSON.parse(rawResponse);
		response.forEach(appendChildToMainStructure);
		addDetailsDiv();
	} else {
		addError(statusCode);
	}
}
