import { ipcMain } from "electron";

export interface TrackEventItem {
  name: string;
  data?: unknown;
}

export function bindAnalyticIpc() {
  ipcMain.handle(
    "send-analytic",
    (_, deviceId: string, events: TrackEventItem[]) => {
      console.log("Sending", deviceId, events);

      fetch("https://studio.outerbase.com/api/events", {
        method: "POST",
        body: JSON.stringify({
          events,
        }),
        headers: {
          "Content-Type": "application/json",
          "x-od-id": deviceId,
        },
      })
        .then()
        .catch();
    },
  );
}
