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
    let rj = await response.json();
    return rj.exerciseSets || [];
  }

  async function enrichAcitvity(activity, authHeader) {
    if (
      activity &&
      activity.activityType &&
      activity.activityType.typeKey === "strength_training"
    ) {
      activity.fullExerciseSets = [
        ...(await fetchActivityExerciseSets(activity.activityId, authHeader)),
      ];
    }
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
          allActivities.length
        )
          .then((activities) => {
            console.log(
              `Before extension we have ${activities.length} activities`
            );
            return Promise.all(
              activities.map((a) => enrichAcitvity(a, message.authHeader))
            );
          })
          .catch(console.error);
        if (!!activities) {
          console.log(
            `After extension we have ${activities.length} activities`
          );
          console.log(activities);
          allActivities.push(...activities);
          if (activities.length < PAGE_SIZE) break;
        } else {
          break;
        }
      }
      const fileName = `garmin-workouts-${
        message.numActivitiesToFetch
      }-${new Date().toISOString().substring(0, 10)}`;
      downloadJsonAsFile(allActivities, fileName);
    }
  });
})();
