declare var chrome: any;
var cookie = {
	firstPartyDomain: "oxygenrain.com",
	name: "yourtime-token",
}

browser.cookies.getAll(cookie)
	.then((content) => {
		console.log(content)
		if (content !== null) {
			$("#loginStatus").text("Logged in");
			$("#login")
				.text("Log out")
				.attr("href", "javascript:logOut()");
		}
	});

function logOut() {
	browser.cookies.remove(cookie);
	$("#loginStatus").text("Currently not logged in");
	$("#login")
		.text("Log in with Google")
		.attr("href", "https://oxygenrain.com/yourtime/auth/google.html");
}
