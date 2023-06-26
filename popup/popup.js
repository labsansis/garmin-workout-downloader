document.getElementById("dl-form").onsubmit = () => {
  console.log("Go time");
  console.log(parseInt(document.getElementById("numactivities").value));
  browser.tabs
    .query({ currentWindow: true, active: true })
    .then((ts) => {
      browser.tabs.sendMessage(ts[0].id, {
        command: "fetch",
        authHeader: browser.extension.getBackgroundPage().getGarminAuthHeader(),
        numActivitiesToFetch: parseInt(
          document.getElementById("numactivities").value
        ),
      });
    })
    .catch(console.error);
};
