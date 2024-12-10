import { DatabaseInstanceStoreItem } from "@/lib/db-manager-store";
import {
  ipcRenderer,
  contextBridge,
  type OpenDialogOptions,
  type OpenDialogReturnValue,
} from "electron";
import { type ConnectionStoreItem } from "@/lib/conn-manager-store";
import { type ContainerInspectInfo, type ContainerInfo } from "dockerode";

// Get connection id
const connectionId = process.argv
  .find((arg) => arg.startsWith("--database="))
  ?.substring(11);

console.log("Connection ID", connectionId);

const outerbaseIpc = {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args),
    );
  },

  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },

  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },

  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },

  query(statement: string) {
    return ipcRenderer.invoke("query", connectionId, statement);
  },

  transaction(statements: string[]) {
    return ipcRenderer.invoke("transaction", connectionId, statements);
  },

  close() {
    return ipcRenderer.invoke("close");
  },

  connect(conn: ConnectionStoreItem, enableDebug?: boolean) {
    return ipcRenderer.invoke("connect", conn, enableDebug);
  },

  openFileDialog(options?: OpenDialogOptions): Promise<OpenDialogReturnValue> {
    return ipcRenderer.invoke("open-file-dialog", options);
  },

  docker: {
    start(containerId: string) {
      return ipcRenderer.invoke("docker-start", containerId);
    },

    stop(containerId: string) {
      return ipcRenderer.invoke("docker-stop", containerId);
    },

    list(): Promise<ContainerInfo[]> {
      return ipcRenderer.invoke("docker-list");
    },

    create(containerData: DatabaseInstanceStoreItem) {
      return ipcRenderer.invoke("docker-create", containerData);
    },

    remove(containerId: string) {
      return ipcRenderer.invoke("docker-remove", containerId);
    },

    pull(containerData: DatabaseInstanceStoreItem) {
      return ipcRenderer.invoke("docker-pull", containerData);
    },

    inspect(containerId: string): Promise<ContainerInspectInfo> {
      return ipcRenderer.invoke("docker-inspect", containerId);
    },
  },

  // You can expose other APTs you need here.
  // ...
};

export type OuterbaseIpc = typeof outerbaseIpc;

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("outerbaseIpc", outerbaseIpc);
