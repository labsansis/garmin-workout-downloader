let garminAuthHeader = ""

function extractAuthHeader(e) {
  for (let header of e.requestHeaders) {
    if (header.name === "Authorization") {
      garminAuthHeader = header.value;
    }
  }
}

browser.webRequest.onBeforeSendHeaders.addListener(
  extractAuthHeader,
  { urls: ["*://connect.garmin.com/*"] },
  ["requestHeaders"]
);

function getGarminAuthHeader() {
  return garminAuthHeader;
}
