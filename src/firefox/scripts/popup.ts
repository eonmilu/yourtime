const LOG_IN_URL = "https://oxygenrain.com/yourtime/auth/google.html";

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
	let win = window.open(LOG_IN_URL, "_blank");
	win.focus();
}
