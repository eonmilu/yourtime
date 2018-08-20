browser.storage.local.get("yourtimeauth")
	.then((content) => {
		console.log(content)
		if (Object.keys(content).length) {
			$("#loginStatus").text(`Logged in as ${content.yourtimeauth.username}`);
			$("#login")
				.text("Log out")
				.attr("href", "javascript:logOut()");
		}
	}, (error) => {
		console.log(error)
	});

function logOut() {
	browser.storage.local.remove("yourtimeauth").then(() => {
		$("#loginStatus").text("Currently not logged in");
		$("#login")
			.text("Log in with Google")
			.attr("href", "https://oxygenrain.com/yourtime/auth/google.html");
	}).fail((error) => {
		console.log(error);
	});
}
