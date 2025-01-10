import type { TrackEventItem } from "electron/ipc/analytics";

export function sendAnalyticEvents(events: TrackEventItem[]) {
  let deviceId = localStorage.getItem("od-id");

  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("od-id", deviceId);
  }

  window.outerbaseIpc.sendAnalyticEvents(deviceId, events).then().catch();
}
