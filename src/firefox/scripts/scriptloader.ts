declare var browser: any;
// This meta element contains the stylesheet, upvote and downvote images' internal url
// so that the injected script can access them since it cannot use the browser's APIs
var metaSources = {
    loader: browser.extension.getURL("../resources/loader.svg")
}

// Load jQuery as soon as possible
$("<script/>", { src: browser.extension.getURL("scripts/jquery.min.js") }).appendTo("head");
// Load stylesheet
$("<link/>", {
    src: browser.extension.getURL("../resources/stylesheet.css"),
    rel: "stylesheet"
}).appendTo("head");

// uiConfig to feed to FirebaseUI
/*
let uiConfig = {
    // Whether to upgrade anonymous users should be explicitly provided.
    autoUpgradeAnonymousUsers: true,
    callbacks: {
        signInSuccessWithAuthResult: (authResult, redirectUrl) => {
            // Create cookie for further actions from the content.js script
            let cookieValue = {
                user: authResult.user,
                credential: authResult.credential,
                isNewUser: authResult.additionalUserInfo.isNewUser,
                providerId: authResult.additionalUserInfo.providerId,
                operationType: authResult.operationType
            };
            let setting = browser.cookies.set({
                firstPartyDomain: "oxygenrain.com",
                expirationDate: 2 ** 31 - 1,
                name: "your-time-login",
                secure: true,
                url: "oxygenrain.com/yourtime/",
                value: JSON.stringify(cookieValue)
            });
            setting.then((result) => {
                console.log("Login cookie set");
            }).catch((err) => {
                console.log(`Error setting cookie: ${err}`);
            });
            return true;
        },
        // TODO: handle anonymous user upgrade merge conflicts
        signInFailure: (error) => {
            // Some unrecoverable error occurred during sign-in.
            return handleUIError(error);
        },
        uiShown: () => {
            // TODO:
        }
    },
    signInSuccessUrl: window.location.href,
    signInOptions: [
        {
            provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            scopes: [
                'https://www.googleapis.com/auth/plus.login'
            ],
            customParameters: {
                // Forces account selection even when one account
                // is available.
                prompt: 'select_account'
            },
            authMethod: 'https://accounts.google.com',
        },
        // Leave the lines as is for the providers you want to offer your users.
        firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
    ],
    // Terms of service url.
    tosUrl: browser.extension.getURL("TOS"),
    // Privacy policy url.
    privacyPolicyUrl: browser.extension.getURL("PRIVACY")
};

let fb = $("<div/>", { id: "#firebase-auth-container" });
// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);
*/
let script = $("<script/>", { src: browser.extension.getURL("scripts/content.js") });
let loader = $("<img/>", {
    src: browser.extension.getURL("../resources/loader.svg"),
    alt: "Loading...",
    id: "your-time-loader",
    height: "45px", width: "65px",
    style: "display: block; margin: auto;"
});

let meta = $("<meta/>", {
    name: "your-time-meta",
    content: JSON.stringify(metaSources)
});


// Check every 10 ms if the div has been loaded
var intervalId;
intervalId = setInterval(() => {
    console.log("Searching for target div...");

    // false if it has not loaded.
    if ($("#info-contents").length) {
        console.log("Found target div. Adding script...");

        $("#info-contents").append(loader);
        $("head").append(meta, script);
        clearInterval(intervalId);
    }
}, 10);
