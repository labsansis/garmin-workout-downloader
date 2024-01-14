(function () {
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  const PAGE_SIZE = 20;

  if (!("browser" in self)) {
    self.browser = self.chrome;
  }

  async function fetchActivitiesList(authHeader, pageSize, start) {
    const url = `https://connect.garmin.com/activitylist-service/activities/search/activities?limit=${pageSize}&start=${start}`;

    const response = await fetch(url, {
      credentials: "include",
      headers: {
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "en-GB,en;q=0.5",
        NK: "NT",
        "X-lang": "en-US",
        "DI-Backend": "connectapi.garmin.com",
        Authorization: authHeader,
        "X-Requested-With": "XMLHttpRequest",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "same-origin",
        Pragma: "no-cache",
        "Cache-Control": "no-cache",
      },
      referrer: "https://connect.garmin.com/modern/activities",
      method: "GET",
      mode: "cors",
    });
    return await response.json();
  }

  async function fetchActivityExerciseSets(activityId, authHeader) {
    const url = `https://connect.garmin.com/activity-service/activity/${activityId}/exerciseSets`;
    const responseJson = await fetch(url, {
      credentials: "include",
      headers: {
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "en-GB,en;q=0.5",
        NK: "NT",
        "X-lang": "en-US",
        "DI-Backend": "connectapi.garmin.com",
        Authorization: authHeader,
        "X-Requested-With": "XMLHttpRequest",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "same-origin",
        Pragma: "no-cache",
        "Cache-Control": "no-cache",
      },
      referrer: "https://connect.garmin.com/modern/activities",
      method: "GET",
      mode: "cors",
    })
      .then((resp) => {
        if (resp.ok) return resp.json();
        return {};
      })
      .catch((err) => {
        return {};
      });
    return responseJson.exerciseSets || [];
  }

  async function enrichAcitvity(activity, authHeader) {
    activity.fullExerciseSets = [
      ...(await fetchActivityExerciseSets(activity.activityId, authHeader)),
    ];
    return activity;
  }

  function downloadJsonAsFile(data, filename) {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(data));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `${filename}.json`);
    dlAnchorElem.click();
  }

  browser.runtime.onMessage.addListener(async (message) => {
    if (message.command === "fetch") {
      let allActivities = [];
      console.log(`We have ${message.numActivitiesToFetch} activites to fetch`);
      while (allActivities.length < message.numActivitiesToFetch) {
        let activities = await fetchActivitiesList(
          message.authHeader,
          PAGE_SIZE,
          allActivities.length,
        )
          .then((activities) => {
            console.debug(
              `Before extension we have ${activities.length} activities`,
            );
            return Promise.all(
              activities.map((a) => enrichAcitvity(a, message.authHeader)),
            );
          })
          .catch((err) => {
            browser.runtime.sendMessage({ status: "loadingError", error: err });
            console.error(err);
          });
        if (!!activities) {
          console.debug(
            `After extension we have ${activities.length} activities`,
          );
          console.debug(activities);
          allActivities.push(...activities);
          if (activities.length < PAGE_SIZE) break;
        } else {
          break;
        }
      }
      allActivities = allActivities.slice(0, message.numActivitiesToFetch);
      const fileName = `garmin-workouts-${new Date()
        .toISOString()
        .substring(0, 10)}_${message.numActivitiesToFetch}`;
      downloadJsonAsFile(allActivities, fileName);
      browser.runtime.sendMessage({
        status: "loadingSuccess",
        numActivitiesFetched: allActivities.length,
      });
    }
  });
})();
