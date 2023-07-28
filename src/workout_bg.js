if (!("browser" in self)) {
  self.browser = self.chrome;
}

function extractAuthHeader(e) {
  for (let header of e.requestHeaders) {
    if (header.name === "Authorization" && header.value.startsWith("Bearer")) {
      browser.storage.session.set({ garminAuthHeader: header.value });
    }
  }
}

browser.webRequest.onBeforeSendHeaders.addListener(
  extractAuthHeader,
  { urls: ["*://connect.garmin.com/*"] },
  ["requestHeaders"],
);
