var firebaseUser;
browser.cookies.get({
    firsyPartyDomain: "oxygenrain.com",
    name: "your-time-login",
    url: "oxygenrain.com/yourtime/"
}
).then((c) => {
    if (c === null) {
        // If there's no cookie, create a new anonymous user
        firebaseUser = firebase.auth().currentUser;
    } else {
        firebaseUser = JSON.parse(c.value);
    }
})

// Check every 10 ms if jQuery has been loaded
var intervalId;
intervalId = setInterval(() => {
    if (!(typeof $ === 'undefined' || $ === null)) {
        clearInterval(intervalId);
        const SELECT_URL = "https://oxygenrain.com/yourtime/search";
        const INSERT_URL = "https://oxygenrain.com/yourtime/insert";
        const META = JSON.parse(document.getElementsByTagName('meta')['your-time-meta'].getAttribute('content'));
        const DEFAULT_TIMEOUT = 5000;

        var lastId = "";

        // Transform seconds to ((days):(hours):)minutes:seconds
        function secondsToString(ss: any): string {
            // Ignore negative seconds and types other than number
            if (ss < 0 || !(ss / ss === 1)) return undefined;

            let dd: any = Math.floor(ss / (3600 * 24));
            ss -= dd * 3600 * 24;
            let hh: any = Math.floor(ss / 3600);
            ss -= hh * 3600;
            let mm: any = Math.floor(ss / 60);
            ss -= mm * 60;

            // Ensure two-digits
            [dd, hh, mm, ss] = [dd, hh, mm, ss].map(x => x < 10 ? x = "0" + x : x);

            let time = `${dd}:${hh}:${mm}:${ss}`

            // Remove unnecessary "00:"s, keeping the last two for formatting
            return time.replace(/^(00\:){1,2}/gm, "");
        }

        // Make numbers human-readable
        function readablizeNumber(n: number): string {
            let s = ['', 'k', 'M', 'B'];
            let e = Math.floor(Math.log(n) / Math.log(1000));
            return Math.round((n / Math.pow(1000, e))) + s[e];
        }

        // Add main skeleton, where the children will be added
        function addMainStructure(): void {
            $("<div/>", { id: "your-time" }).appendTo("#info-contents"); // Main div
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
            seconds.innerText = secondsToString(parseInt(childData["time"]));
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
        function processResponse(rp: string, statusCode: string): void {
            /* STATUS CODES
            200: Found
            210: Not found
            220: Internal error
            */

            if (statusCode == "200") {
                let response = JSON.parse(rp);
                response.forEach(element => {
                    appendChildToMainStructure(element);
                });
            } else {
                addError(statusCode);
            }
        }

        function addError(statusCode: string) {
            let mainTextMsg, secTextMsg, secTextOnclick;
            switch (statusCode) {
                case "210":
                    mainTextMsg = "Your Time didn't find any timemarks for this video. "
                    secTextMsg = "Submit your own. "
                    secTextOnclick = addTimemark;
                    break;
                case "":
                case "220":
                    mainTextMsg = "Internal server error. "
                    secTextMsg = "Try again later."
                    secTextOnclick = null;
                    break;
                default:
                    mainTextMsg = "Unknown error code"
                    secTextMsg = "Are you using the latest Your Time version?"
                    secTextOnclick = () => {
                        let win = window.open('https://addons.mozilla.org/en-US/firefox/addon/your-time/', '_blank');
                        win.focus();
                    };
                    break;
            }

            $("<div/>", { id: "your-time-error" }).append(
                $("<span/>", {
                    class: "main-text",
                    innerText: mainTextMsg
                }),
                $("<a/>", {
                    class: "secondary-text", onclick: secTextOnclick, innerText: secTextMsg
                })
            ).appendTo($("#your-time"))
        }

        function removeMainStructure(): void {
            while ($("#your-time").length) {
                $("#info-contents").children("#your-time").remove();
            }
            while ($("#your-time-loader").length) {
                $("#info-contents").children("#your-time-loader").remove();
            }
        }

        function addTimemark() {
            alert("TODO:");
        }

        // Get ID of YouTube video from URL
        var id = window.location.href.match(/v=[^&]*/)[0];
        lastId = "";
        console.log(lastId);

        // Player MUST be assigned with document.getElementById, otherwise the YouTube API will not work
        var player: any = document.getElementById("movie_player");
        player.addEventListener("onStateChange", (statusInteger: any) => {
            // https://developers.google.com/youtube/iframe_api_reference#Events
            // Normally we would use -1 or 5 but YouTube's API is unreliable
            // Therefore we will use 1 (playing) and check if the data has already been loaded
            console.log(statusInteger);
            id = window.location.href.match(/v=[^&]*/)[0];
            if (statusInteger == 1 && lastId != id) {
                lastId = id;
                removeMainStructure();
                main();
            }
        });

        // HACK: Make sure the pause/play event is fired
        player.pauseVideo();
        player.playVideo();

        function main() {
            $.ajax({
                method: "GET",
                url: SELECT_URL,
                dataType: "text",
                data: { v: id },
                timeout: DEFAULT_TIMEOUT
            }).done(rp => {
                // Response's first 3 characters will be the status code
                let statusCode = rp.substr(0, 3);
                // Anything else is considered JSON
                let response = rp.substr(3);

                addMainStructure();
                processResponse(response, statusCode);
            }).fail((jqXHR, textStatus, error) => {
                addError("220");
                console.log(error);
                console.log(jqXHR);
                console.log(textStatus);
            })
        };
    }

}, 10);
