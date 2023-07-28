if (!("browser" in self)) {
  self.browser = self.chrome;
}

window.onload = () => {
  browser.tabs.query({ currentWindow: true, active: true }).then((tabs) => {
    const activeTabUrl = tabs[0].url;
    if (!activeTabUrl.startsWith("https://connect.garmin.com")) {
      document.getElementById("instruction-wrong-url").style.display = "block";
      document.getElementById("dl-form").style.display = "none";
    } else {
      browser.storage.session.get(["garminAuthHeader"]).then((store) => {
        if (!store.garminAuthHeader) {
          document.getElementById("instruction-other").innerHTML =
            "Sign in or refresh the page to download workout data.";
          document.getElementById("instruction-other").style.display = "block";
          document.getElementById("dl-form").style.display = "none";
        }
      });
    }
  });
};

document.getElementById("dl-form").onsubmit = (e) => {
  e.preventDefault();
  console.log("Go time");
  browser.storage.session.get(["garminAuthHeader"]).then((store) => {
    console.log(parseInt(document.getElementById("numactivities").value));
    document.getElementById("loader-container").style.display = "block";
    browser.tabs
      .query({ currentWindow: true, active: true })
      .then((ts) => {
        browser.tabs.sendMessage(ts[0].id, {
          command: "fetch",
          authHeader: store.garminAuthHeader,
          numActivitiesToFetch: parseInt(
            document.getElementById("numactivities").value,
          ),
        });
      })
      .catch(console.error);
  });
};

browser.runtime.onMessage.addListener((message) => {
  if (message.status === "loadingSuccess") {
    document.getElementById("loader-container").style.display = "none";
    document.getElementById("error-content").style.display = "none";
    document.getElementById("success-content").style.display = "block";
    document.getElementById(
      "success-content",
    ).innerHTML = `Downloaded ${message.numActivitiesFetched} activities!`;
  } else if (message.status === "loadingError") {
    document.getElementById("loader-container").style.display = "none";
    document.getElementById("success-content").style.display = "none";
    document.getElementById("error-content").style.display = "block";
    document.getElementById(
      "error-content",
    ).innerHTML = `Failed to retrieve workout data`;
  }
});
