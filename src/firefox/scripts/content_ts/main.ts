const SelectURL = "https://xmi.lu/yourtime/search";
const InsertURL = "https://xmi.lu/yourtime/insert";
const ExtensionURL = "https://addons.mozilla.org/firefox/addon/yourtime/";
const VotesURL = "https://xmi.lu/yourtime/votes";
const Meta = JSON.parse($("meta[name='your-time-meta'").attr('content'));
const DefaultTimeout = 3000;
const Playing = 1;
const StatusCodes = {
	Found: "200",
	NotFound: "210",
	Error: "220"
};
const Votes = {
	Down: 0,
	Up: 1
}

var lastId = "";
var videoID = getCurrentVideoID();
// Must use document.getElementById, otherwise the API will not work
const player: any = document.getElementById("movie_player");
player.addEventListener("onStateChange", (statusInteger: Number) => {
	// https://developers.google.com/youtube/iframe_api_reference#Events
	// The UNSTARTED or CUED status should be used.
	// However, YouTube's IFrame Player API is unreliable,
	// so we shall use Playing and check if the timemarks have been loaded
	videoID = getCurrentVideoID();
	if (statusInteger == Playing && lastId != videoID) {
		lastId = videoID;
		appendLoader();
		onLayoutLoaded();
	}
});

ensureStateChange();

function ensureStateChange() {
	// HACK: Make sure the pause/play event is fired
	player.pauseVideo();
	player.playVideo();
}

function getCurrentVideoID(): string {
	const id = window.location.href.match(/v=([^&]*)/)[1];
	return id;
}
