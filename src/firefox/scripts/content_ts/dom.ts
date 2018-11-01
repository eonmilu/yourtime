function onLayoutLoaded(): void {
	removeMainStructure();
	$.ajax({
		method: "GET",
		url: SelectURL,
		dataType: "text",
		data: {
			v: videoID
		},
		xhrFields: {
			withCredentials: true
		},
		timeout: DefaultTimeout,
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
		const errors = getErrors(StatusCodes.Error);
		addErrors(errors);
	});
}

function addMainStructure(): void {
	const yourtime = $("<div/>", {
		id: "your-time"
	});
	const submissions = $("<div/>", {
		id: "your-time-submissions"
	});

	yourtime.append(submissions);
	yourtime.appendTo("#info-contents");
}

// Parse and add the response to the DOM
function processResponse(statusCode: string, rp: string): void {
	if (statusCode == StatusCodes.Found) {
		const response = JSON.parse(rp);
		// forEach must be in the lambda so that jQuery only uses the first parameter
		response.timemarks.map(timemark => {
			return makeTimemark(timemark, response.authors);
		}).forEach(element => {
			$("#your-time-submissions").append(element)
		});
		addDetailsDiv();
	} else {
		const errors = getErrors(statusCode);
		addErrors(errors);
	}
}

function addDetailsDiv() {
	const details = $("<div/>", {
		id: "your-time-details"
	}).text("Click on one of above's timemarks to see it's content. Click twice to be taken to that timemark.");

	details.appendTo("#your-time");
}

function addErrors({ main, secondary }) {
	const yourtimeError = $("<div/>", {
		id: "your-time-error"
	});

	yourtimeError.append(
		main,
		secondary
	);

	yourtimeError.appendTo($("#your-time"));
	$("#your-time").show()
}

function getErrors(statusCode: string): { main: JQuery<HTMLElement>, secondary: JQuery<HTMLElement> } {
	const main = $("<span/>", {
		class: "main-text"
	});
	const secondary = $("<a/>", {
		class: "secondary-text",
	});

	switch (statusCode) {
		case StatusCodes.NotFound:
			main.text("Your Time didn't find any timemarks for this video.");
			secondary.text("Submit your own.");
			secondary.click(createUserTimemark);
			break;
		case StatusCodes.Error:
			main.text("Your Time could not connect to the server.");
			secondary.text("Try again later.");
			secondary.click(null);
			break;
		default:
			main.text("Unknown status code.");
			secondary.text("Are you using the latest Your Time version?")
			secondary.click(() => {
				window.open(ExtensionURL, "_blank").focus();
			});
			break;
	}

	return { main, secondary }
}

function makeTimemark(timemarkData: any, authors: any): JQuery<HTMLElement> {
	const timemark = makeBaseTimemark(timemarkData);

	timemark.on("dblclick", () => {
		player.seekTo($(timemark).attr("seconds"));
	});

	timemark.hover(
		() => { $(timemark).attr("style", `background-color: ${votesToRGBA(timemarkData.votes, true)}`); },
		() => { $(timemark).attr("style", `background-color: ${votesToRGBA(timemarkData.votes, false)}`); }
	);

	timemark.click(function () {
		// Set all other timemarks' font lighter
		const timemarks: any = $(".timemark");
		// forEach loop apparently does not exist on timemarks
		for (let i = 0; i < timemarks.length; i++) {
			const element = timemarks[i];
			$(element).attr("class", "timemark");
		}
		// Set this font bolder
		$(timemark).attr("class", "timemark clicked");

		const details = $("#your-time-details");
		const comment = $(timemark).attr("comment");
		details.text(truncate(comment, 140));

		const authorID = $(timemark).attr("author");
		const authorData = authors.find(a => {
			return a.id == authorID
		});
		const author = $("<a/>", {
			href: authorData.url,
			title: "User #" + authorData.id,
			id: "author"
		}).text(truncate(authorData.username, 16))

		// Get given vote number by the server
		const votesReceived = Number($(timemark).attr("votes"));

		const votes = $("<div/>", {
			id: "votes"
		});

		const upvote = makeVote(timemark, Votes.Up);
		const downvote = makeVote(timemark, Votes.Down);

		const voteNumber = $("<span/>", {
			id: "number"
		}).text(readablizeNumber(Number($(timemark).attr("votes"))));

		switch ($(timemark).attr("status")) {
			case "upvoted":
				// Add a vote
				voteNumber.text(readablizeNumber(votesReceived + 1));

				// Set downvote gray, number and self orange
				upvote.attr("style", "border-bottom: 8px solid orange;");
				voteNumber.attr("style", "color: orange");
				downvote.attr("style", "border-bottom: 8px solid gray;");
				break;
			case "downvoted":
				// Substract a vote
				voteNumber.text(readablizeNumber(votesReceived - 1));

				// Set upvote gray, number and self blue
				downvote.attr("style", "border-bottom: 8px solid blue;");
				voteNumber.attr("style", "color: blue");
				upvote.attr("style", "border-bottom: 8px solid gray;");
				break;
			default:
				break;
		}

		votes.append(upvote, voteNumber, downvote);
		details.prepend(author);
		details.prepend(votes);
	});

	return timemark
}

function makeVote(parentTimemark: JQuery<HTMLElement>, type: number) {
	const isDownvote = type == Votes.Down;

	const vote = $("<div/>", {
		id: isDownvote ? "downvote" : "upvote"
	}).click(function () {
		const status = $(parentTimemark).attr("status");
		// Decide if the user clicked to undo their vote:
		// based on the type passed (Votes.Up/Votes.Down), convert it to text
		// and compare it to the status of the parent timemark.
		// If it's equal, it means the user wants to undo it.
		// Else, it is treated like a normal vote.
		const undoVote = (type == Votes.Up ? "upvoted" : "downvoted") == status;

		if (undoVote) {
			setVote(this, parentTimemark);
		} else {
			setVote(this, parentTimemark, {
				newStatus: isDownvote ? "downvoted" : "upvoted",
				vote: isDownvote ? -1 : 1,
				color: isDownvote ? "blue" : "orange",
				oppositeID: isDownvote ? "#upvote" : "#downvote"
			})
		}
	});
	return vote;
}

function setVote(env: HTMLElement, parentTimemark: JQuery<HTMLElement>, params: {
	newStatus: string, vote: number, color: string, oppositeID: string
} = {
		newStatus: "unset",
		vote: 0,
		color: "gray",
		oppositeID: "#upvote #downvote"
	}) {
	const votesReceived = Number($(parentTimemark).attr("votes"));
	const { newStatus, vote, color, oppositeID } = params;

	$(parentTimemark).attr("status", newStatus);
	const status = $(parentTimemark).attr("status");
	changeServerVotes(status, $(parentTimemark).attr("ID"));
	// Set vote number to default
	$("#votes #number").text(readablizeNumber(votesReceived + vote));
	// Set everything gray
	$(env).attr("style", `border-bottom: 8px solid ${color};`);
	$("#votes #number").attr("style", `color: ${color}`);
	$(`#votes ${oppositeID}`).attr("style", "border-bottom: 8px solid gray;");
}

function makeBaseTimemark(timemarkData: any) {
	const timemark = $("<button/>", {
		class: "timemark",
		ID: timemarkData.id,
		comment: timemarkData.content,
		votes: timemarkData.votes,
		seconds: timemarkData.timemark,
		status: "unset",
		author: timemarkData.author
	}).text(secondsToTimestamp(timemarkData.timemark));
	timemark.attr("style", `background-color: ${votesToRGBA(timemarkData.votes)}`);

	return timemark
}

function createUserTimemark() {

}

function removeMainStructure(): void {
	while ($("#your-time").length) {
		$("#your-time").remove();
	}
}

function appendLoader(): void {
	const LoaderIcon = $("<img/>", {
		src: Meta.loaderIconURL,
		id: "your-time-loader",
		style: "display: block; margin: auto; margin-top: 5px;"
	}).height("25px");
	LoaderIcon.appendTo($("#info-contents"));
}

function changeServerVotes(action: string, id: string) {
	$.ajax({
		method: "POST",
		url: VotesURL,
		data: {
			id: id,
			action: action
		},
		xhrFields: {
			withCredentials: true
		},
		timeout: DefaultTimeout
	}).done(function () {
		console.log("Sent vote");
	});
}
