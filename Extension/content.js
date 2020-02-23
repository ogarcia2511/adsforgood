chrome.runtime.sendMessage({ cmd: "getName" }, function (response) {
    var appbar = document.getElementById('appbar');

    var node = document.createElement("div");

    node.innerHTML = "<iframe width=\"468\" height=\"60\" src=\"https://adsforgood.dallen.io/ad?user=" + response.username + "\" style=\"border: none;overflow: hidden;padding-left: 12em;\" scrolling=\"no\"></iframe>";

    appbar.appendChild(node);
});


