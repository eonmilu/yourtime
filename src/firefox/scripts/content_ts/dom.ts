function onLayoutLoaded(): void {
	removeMainStructure();
	$.ajax({
		method: "GET",
		url: SelectURL,
		dataType: "text",
		data: {
			v: videoID
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
		addError("220");
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
function processResponse(statusCode: string, response: string): void {
	if (statusCode == StatusCodes.Found) {
		const timemarks = JSON.parse(response);
		// Get timemark from data and append it to main structure
		timemarks.map(getTimemark).forEach($("#your-time-submissions").append);
		addDetailsDiv();
	} else {
		addError(statusCode);
	}
}

function addDetailsDiv() {
	const details = $("<div/>", {
		id: "your-time-details"
	}).text("Click on one of above's timemarks to see it's content. Click twice to be taken to that timemark.");

	details.appendTo("#your-time");
}

function addError(statusCode: string) {
	const yourtimeError = $("<div/>", {
		id: "your-time-error"
	});

	const errors = getErrors(statusCode);

	yourtimeError.append(
		errors.main,
		errors.secondary
	);

	yourtimeError.appendTo($("#your-time"));
	$("#your-time").show()
}

function getErrors(statusCode: string): { main: JQuery<HTMLElement>, secondary: JQuery<HTMLElement> } {
	const errors = {
		main: $("<span/>", {
			class: "main-text"
		}),
		secondary: $("<a/>", {
			class: "secondary-text",
		})
	}
	switch (statusCode) {
		case StatusCodes.NotFound:
			errors.main.text("Your Time didn't find any timemarks for this video.");
			errors.secondary.text("Submit your own.");
			errors.secondary.click(createTimemark);
			break;
		case StatusCodes.Error:
			errors.main.text("Your Time could not connect to the server.");
			errors.secondary.text("Try again later.");
			errors.secondary.click(null);
			break;
		default:
			errors.main.text("Unknown status code.");
			errors.secondary.text("Are you using the latest Your Time version?")
			errors.secondary.click(() => {
				window.open(ExtensionURL, "_blank").focus();
			});
			break;
	}

	return errors
}

function getTimemark(timemarkData: any): any {
	const timemark = $("<div/>", {
		class: "timemark",
		ID: timemarkData.id,
		comment: timemarkData.content,
		votes: timemarkData.votes,
		seconds: timemarkData.timemark,
		status: "unset"
	}).text(secondsToTimestamp(timemarkData.timemark));
	timemark.attr("style", `background-color: ${votesToRGBA(timemarkData.votes)}`);

	timemark.click(function () {
		const details = $("#your-time-details");
		const comment = $(this).attr("comment");
		details.text(comment);

		const parentTimemark = this;
		// Get given vote number by the server
		const votesReceived = Number($(this).attr("votes"));

		const votes = $("<div/>", {
			id: "votes"
		});

		const upvote = $("<div/>", {
			id: "upvote"
		}).click(function () {
			// Read the status (upvoted, unset, downvoted)
			const Status = $(parentTimemark).attr("status");
			switch (status) {
				case "upvoted":
					// Set parent timemarks' status to unset
					$(parentTimemark).attr("status", "unset");
					changeServerVotes($(parentTimemark).attr("status"), $(parentTimemark).attr("ID"));

					// Set vote number to default
					$("#votes #number").text(readablizeNumber(votesReceived));


					// Set everything gray
					$(this).attr("style", "border-bottom: 8px solid gray;");
					$("#votes #number").attr("style", "color: gray");
					$("#votes #downvote").attr("style", "border-bottom: 8px solid gray;");
					break;
				case "unset":
				case "downvoted":
					// Set parent timemarks' status to upvoted
					$(parentTimemark).attr("status", "upvoted");
					changeServerVotes($(parentTimemark).attr("status"), $(parentTimemark).attr("ID"));

					// Add a vote
					$("#votes #number").text(readablizeNumber(votesReceived + 1));


					// Set downvote gray, number and self orange
					$(this).attr("style", "border-bottom: 8px solid orange;");
					$("#votes #number").attr("style", "color: orange");
					$("#votes #downvote").attr("style", "border-bottom: 8px solid gray;");
					break;
				default:
					break;
			}
		});
		const downvote = $("<div/>", {
			id: "downvote"
		}).click(function () {
			// Read the status (upvoted, unset, downvoted)
			const Status = $(parentTimemark).attr("status");
			switch (status) {
				case "downvoted":
					// Set parent timemarks' status to unset
					$(parentTimemark).attr("status", "unset");
					changeServerVotes($(parentTimemark).attr("status"), $(parentTimemark).attr("ID"));

					// Set vote number to default
					$("#votes #number").text(readablizeNumber(votesReceived));


					// Set everything gray
					$(this).attr("style", "border-bottom: 8px solid gray;");
					$("#votes #number").attr("style", "color: gray");
					$("#votes #downvote").attr("style", "border-bottom: 8px solid gray;");
					break;
				case "unset":
				case "upvoted":
					// Set parent timemarks' status to downvoted
					$(parentTimemark).attr("status", "downvoted");
					changeServerVotes($(parentTimemark).attr("status"), $(parentTimemark).attr("ID"));

					// Substract a vote
					$("#votes #number").text(readablizeNumber(votesReceived - 1));


					// Set upvote gray, number and self blue
					$(this).attr("style", "border-bottom: 8px solid blue;");
					$("#votes #number").attr("style", "color: blue");
					$("#votes #upvote").attr("style", "border-bottom: 8px solid gray;");
					break;
				default:
					break;
			}
		});

		const voteNumber = $("<span/>", {
			id: "number"
		}).text(readablizeNumber(Number($(this).attr("votes"))));

		switch ($(parentTimemark).attr("status")) {
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
		details.prepend(votes);

		$(this).attr("style", `background-color: ${votesToRGBA(timemarkData.votes, true)}`);
	});

	timemark.on("dblclick", function () {
		player.seekTo($(this).attr("seconds"));
	});

	timemark.hover(
		function () {
			$(this).attr("style", `background-color: ${votesToRGBA(timemarkData.votes, true)}`);
		},
		function () {
			$(this).attr("style", `background-color: ${votesToRGBA(timemarkData.votes, false)}`);
		}
	);

	return timemark
}

function createTimemark() {

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
		timeout: DefaultTimeout
	}).done(function () {
		console.log("Sent vote");
	});
}
