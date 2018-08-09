// Enable or disable the extension after a click on the logo
$("#logo").click(() => {
    //TODO:
    console.log("Dddddddd")
});

var cookie = {
    firstPartyDomain: "oxygenrain.com",
    name: "your-time-login",
    url: "oxygenrain.com/yourtime/"
}

browser.cookies.get(cookie)
    .then((content) => {
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
