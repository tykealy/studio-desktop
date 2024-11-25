import { parseSafeJson } from "./json-help";

export interface DatabaseInstanceStoreItem {
  id: string;
  name: string;
  type: string;
  version: string;
  config: {
    port: string;
    username?: string;
    password?: string;
  };
}

export class DatabaseManagerStore {
  static generateShortId() {
    let x = "";
    for (let i = 0; i < 6; i++)
      x += "1234567890qwertyuiopasdfghjklzxcvbnm"[
        Math.floor(36 * Math.random())
      ];

    return x;
  }

  static list() {
    return parseSafeJson<DatabaseInstanceStoreItem[]>(
      window.localStorage.getItem("instances"),
      [],
    );
  }

  static add(data: DatabaseInstanceStoreItem) {
    const list = DatabaseManagerStore.list();
    list.push(data);
    window.localStorage.setItem("instances", JSON.stringify(list));
  }

  static remove(id: string) {
    const list = DatabaseManagerStore.list();
    const newList = list.filter((x) => x.id !== id);
    window.localStorage.setItem("instances", JSON.stringify(newList));
  }
}
