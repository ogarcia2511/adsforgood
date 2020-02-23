let username = undefined;

chrome.storage.sync.get(['username'], function (result) {
    if (result.username !== undefined) {
        username = result.username;
        console.log("Set1"); 
        return;
    }

    username = Date.now();
    chrome.storage.sync.set({ username: username }, function () { 
        console.log("Set2"); 
    });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (username !== undefined) {
        sendResponse({ username: username });
        return;
    }
});