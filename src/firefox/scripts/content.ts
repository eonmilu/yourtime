const SELECT_URL = "https://oxygenrain.com/yourtime/search";
const INSERT_URL = "https://oxygenrain.com/yourtime/insert";
const META = JSON.parse($("meta[name='your-time-meta'").attr('content'));
const DEFAULT_TIMEOUT = 1500;
const EXTENSION_URL = "https://addons.mozilla.org/firefox/addon/yourtime/";
const STATUS_CODE = {
	FOUND: "200",
	NOT_FOUND: "210",
	ERROR: "220"
};

var loaderIcon = $("<img/>", {
	src: META.loaderIconURL,
	id: "your-time-loader",
	style: "display: block; margin: auto; margin-top: 5px;"
}).height("25px");
loaderIcon.appendTo($("#info-contents"));

var lastId = "";
var videoID = getCurrentVideoID();

// Must use document.getElementById, otherwise the API will not work
var player: any = document.getElementById("movie_player");
player.addEventListener("onStateChange", (statusInteger: Number) => {
	// https://developers.google.com/youtube/iframe_api_reference#Events
	// The UNSTARTED or CUED status should be used.
	// However, YouTube's IFrame Player API is unreliable,
	// so we shall use PLAYING and check if the timemarks have been loaded
	videoID = getCurrentVideoID();
	if (statusInteger == YT.PlayerState.PLAYING && lastId != videoID) {
		lastId = videoID;
		loaderIcon.appendTo($("#info-contents"));
		onLayoutLoaded();
	}
});

ensureStateChange();

function getCurrentVideoID(): string {
	let id = window.location.href.match(/v=([^&]*)/)[1];
	return id;
}

function onLayoutLoaded() {
	removeMainStructure();
	$.ajax({
		method: "GET",
		url: SELECT_URL,
		dataType: "text",
		data: { v: videoID },
		timeout: DEFAULT_TIMEOUT,
	}).always(() => {
		addMainStructure();
		$("#your-time-loader").remove();
	}).done(rawResponse => {
		// Response's first 3 characters are the status code
		// Anything else is considered JSON
		let statusCode = rawResponse.substr(0, 3);
		let response = rawResponse.substr(3);

		processResponse(statusCode, response);
	}).fail((jqXHR, textStatus, error) => {
		console.log(jqXHR, textStatus, error);
		addError("220");
	});
}

function ensureStateChange() {
	// HACK: Make sure the pause/play event is fired
	player.pauseVideo();
	player.playVideo();
}

// Transform seconds to ((days):(hours):)minutes:seconds
function secondsToDate(ss: any): string {
	// Ignore negative seconds and types other than number
	if (ss < 0 || typeof ss != "number")
		return undefined;

	let dd: any = Math.floor(ss / (3600 * 24));
	ss -= dd * 3600 * 24;
	let hh: any = Math.floor(ss / 3600);
	ss -= hh * 3600;
	let mm: any = Math.floor(ss / 60);
	ss -= mm * 60;

	// Ensure two-digits
	[dd, hh, mm, ss] = [dd, hh, mm, ss].map(p => p < 10 ? p = "0" + p : p);

	let time = `${dd}:${hh}:${mm}:${ss}`;

	// Remove unnecessary "00:"s, keeping the last two for formatting
	return time.replace(/^(00\:){1,2}/gm, "");
}

// Make numbers human-readable
function readablizeNumber(n: number): string {
	let s = ['', 'k', 'M', 'B'];
	let e = Math.floor(Math.log(n) / Math.log(1000));
	return Math.round((n / Math.pow(1000, e))) + s[e];
}

function addMainStructure(): void {
	$("<div/>", {
		id: "your-time"
	}).appendTo("#info-contents");
}

function appendChildToMainStructure(childData: any): void {
	// TODO: redesing, rewrite with jQuery
	let submission = document.createElement("div");
	let votes = document.createElement("div");
	let upvote = document.createElement("svg");
	let number = document.createElement("span");
	let downvote = document.createElement("svg");
	let seconds = document.createElement("a");
	let comment = document.createElement("span");
	let triangle = document.createElement("polygon");

	submission.className = "submission";
	votes.className = "votes";
	upvote.className = "upvote";
	number.className = "number";
	downvote.className = "downvote";
	seconds.className = "seconds";
	comment.className = "comment";

	upvote.appendChild(triangle);
	downvote.appendChild(triangle);

	number.innerText = readablizeNumber(childData["votes"]);
	seconds.innerText = secondsToDate(parseInt(childData["time"]));
	seconds.addEventListener('click', function () {
		// HACK: bypass TS' type check
		player["seekTo"](childData["time"]);
	});
	seconds.rel = "nofollow";
	comment.innerText = childData["comment"];

	votes.appendChild(upvote);
	votes.appendChild(number);
	votes.appendChild(downvote);

	submission.appendChild(votes);
	submission.appendChild(seconds);
	submission.appendChild(comment);

	$("#your-time").append(submission);
}

// Parse and add the response to the DOM
function processResponse(statusCode: string, rawResponse: string): void {
	if (statusCode == STATUS_CODE.FOUND) {
		let response = JSON.parse(rawResponse);
		response.forEach(appendChildToMainStructure);
	} else {
		addError(statusCode);
	}
}

function addError(statusCode: string) {
	let mainTextMsg, secondaryTextMsg, secondaryTextOnclick;
	switch (statusCode) {
		case STATUS_CODE.NOT_FOUND:
			mainTextMsg = "Your Time didn't find any timemarks for this video."
			secondaryTextMsg = "Submit your own."
			secondaryTextOnclick = createTimemark;
			break;
		case STATUS_CODE.ERROR:
			mainTextMsg = "Your Time could not connect to the server"
			secondaryTextMsg = "Try again later."
			secondaryTextOnclick = null;
			break;
		default:
			mainTextMsg = "Unknown status code"
			secondaryTextMsg = "Are you using the latest Your Time version?"
			secondaryTextOnclick = function () {
				let win = window.open(EXTENSION_URL, "_blank");
				win.focus();
			};
			break;
	}

	$("<div/>", {
		id: "your-time-error"
	}).append(
		$("<span/>", {
			class: "main-text"
		}).text(mainTextMsg),
		$("<a/>", {
			class: "secondary-text",
		}).text(secondaryTextMsg)
			.click(secondaryTextOnclick)
	).appendTo($("#your-time"));
	$("#your-time").show()
}

function createTimemark() {

}

function removeMainStructure(): void {
	while ($("#your-time").length) {
		$("#your-time").remove();
	}
}
