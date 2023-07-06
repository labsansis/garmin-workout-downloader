let garminAuthHeader = "";

function extractAuthHeader(e) {
  for (let header of e.requestHeaders) {
    if (header.name === "Authorization" && header.value.startsWith("Bearer")) {
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
