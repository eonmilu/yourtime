// generic error handler
function onError(error){
    console.log(error);
}

function GetVideoID(){
    // gets id of youtube video from url
    // regex ignores "v=" to reuse on GET method
    return window.location.href.match(/v=[^&]*/);
}

var id = GetVideoID()[0];
console.log("Working with: " + id);

browser.runtime.sendMessage({"url": e.target.href});

document.getElementById("count").innerHTML = rp;
