document.getElementById("dl-button").onclick = () => {
    console.log("Go ahead")
    browser.tabs.query({ currentWindow: true, active: true })
        .then(ts => { browser.tabs.sendMessage(ts[0].id, { command: "fetch", authHeader: browser.extension.getBackgroundPage().getGarminAuthHeader() }) })
        .catch(console.error);
}
