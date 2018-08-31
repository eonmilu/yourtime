function onLayoutLoaded(): void {
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

function appendChildToMainStructure(childData: any): void {
	// TODO: Horrible code, must refactor
	const timemark = $("<div/>", {
		class: "timemark",
		ID: childData.id,
		comment: childData.content,
		votes: childData.votes,
		seconds: childData.timemark,
		status: "unset"
	}).text(secondsToTimestamp(childData.timemark));
	timemark.attr("style", `background-color: ${votesToRGBA(childData.votes)}`);

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
			const status = $(parentTimemark).attr("status");
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
			const status = $(parentTimemark).attr("status");
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

		$(this).attr("style", `background-color: ${votesToRGBA(childData.votes, true)}`);
	});

	timemark.on("dblclick", function () {
		player.seekTo($(this).attr("seconds"));
	});

	timemark.hover(
		function () {
			$(this).attr("style", `background-color: ${votesToRGBA(childData.votes, true)}`);
		},
		function () {
			$(this).attr("style", `background-color: ${votesToRGBA(childData.votes, false)}`);
		}
	);

	$("#your-time-submissions").append(timemark);
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

function appendLoader(): void {
	const loaderIcon = $("<img/>", {
		src: META.loaderIconURL,
		id: "your-time-loader",
		style: "display: block; margin: auto; margin-top: 5px;"
	}).height("25px");
	loaderIcon.appendTo($("#info-contents"));
}
