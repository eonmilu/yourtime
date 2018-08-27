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
const PLAYING = 1;

const loaderIcon = $("<img/>", {
	src: META.loaderIconURL,
	id: "your-time-loader",
	style: "display: block; margin: auto; margin-top: 5px;"
}).height("25px");
loaderIcon.appendTo($("#info-contents"));

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
		const statusCode = rawResponse.substr(0, 3);
		const response = rawResponse.substr(3);

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

	ensureTwoDigits();

	const time = `${dd}:${hh}:${mm}:${ss}`;

	// Remove unnecessary "00:"s, keeping the last two for formatting
	return time.replace(/^(00\:){1,2}/gm, "");

	function ensureTwoDigits() {
		if (dd < 10)
			dd = "0" + dd;
		if (hh < 10)
			hh = "0" + hh;
		if (mm < 10)
			mm = "0" + mm;
		if (ss < 10)
			ss = "0" + ss;
	}
}

// Make numbers human-readable
function readablizeNumber(n: number): string {
	if (n == 0) return "0"
	const s = ['', 'k', 'M', 'B'];
	const e = Math.floor(Math.log(Math.abs(n)) / Math.log(1000));
	return Math.round((n / Math.pow(1000, e))) + s[e];
}

function addMainStructure(): void {
	const yourtime = $("<div/>", {
		id: "your-time"
	});

	const submissions = $("<div/>", {
		id: "your-time-submissions"
	});
	submissions.append($("<div/>", {
		id: "your-time-details"
	}));

	yourtime.append(submissions);
	yourtime.appendTo("#info-contents");
}

function appendChildToMainStructure(childData: any): void {
	// TODO: redesing, rewrite with jQuery
	const submission = $("<div/>", {
		class: "submission"
	});
	const votes = $("<div/>", {
		class: "votes"
	});

	const upvote = $("<img/>", {
		class: "upvote",
		src: "upvote.svg"
	});

	const downvote = $("<img/>", {
		class: "downvote",
		src: "downvote.svg"
	});

	const number = $("<span/>", {
		class: "number"
	}).text(readablizeNumber(childData.votes));

	const timemark = $("<a/>", {
		class: "timemark",
		rel: "nofollow"
	}).text(secondsToDate(childData.timemark))
		.click(() => {
			player.seekTo(childData.time);
		});

	const content = $("<span/>", {
		class: "content"
	}).text(childData.content);

	votes.append(upvote, number, downvote);
	submission.append(votes, timemark, content);

	$("#your-time-submissions").append(submission);
}

// Parse and add the response to the DOM
function processResponse(statusCode: string, rawResponse: string): void {
	if (statusCode == STATUS_CODE.FOUND) {
		const response = JSON.parse(rawResponse);
		response.forEach(appendChildToMainStructure);
	} else {
		addError(statusCode);
	}
}

function addError(statusCode: string) {
	const yourtimeError = $("<div/>", {
		id: "your-time-error"
	});

	var main = $("<span/>", {
		class: "main-text"
	});
	var secondary = $("<a/>", {
		class: "secondary-text",
	});

	switch (statusCode) {
		case STATUS_CODE.NOT_FOUND:
			main.text("Your Time didn't find any timemarks for this video.");
			secondary.text("Submit your own.");
			secondary.click(createTimemark);
			break;
		case STATUS_CODE.ERROR:
			main.text("Your Time could not connect to the server.");
			secondary.text("Try again later.");
			secondary.click(null);
			break;
		default:
			main.text("Unknown status code.");
			secondary.text("Are you using the latest Your Time version?")
			secondary.click(() => {
				const win = window.open(EXTENSION_URL, "_blank");
				win.focus();
			});
			break;
	}

	yourtimeError.append(
		main,
		secondary
	);

	yourtimeError.appendTo($("#your-time"));
	$("#your-time").show()
}

function createTimemark() {

}

function removeMainStructure(): void {
	while ($("#your-time").length) {
		$("#your-time").remove();
	}
}
