import { ConnectionStoreItem } from "./conn-manager-store";

export function generateConnectionString(
  conn: ConnectionStoreItem,
  hideSecret = true,
): string {
  if (conn.type === "mysql" || conn.type === "dolt") {
    return [
      "mysql://",
      conn.config.username,
      ":",
      hideSecret ? "****" : conn.config.password,
      "@",
      conn.config.host,
      ":",
      conn.config.port ?? "3306",
      conn.config.database ? `/${conn.config.database}` : "",
    ].join("");
  } else if (conn.type === "postgres") {
    return [
      "postgres://",
      conn.config.username,
      conn.config.password
        ? ":" + (hideSecret ? "****" : conn.config.password)
        : "",
      "@",
      conn.config.host,
      ":",
      conn.config.port ?? "5432",
      "/",
      conn.config.database,
    ].join("");
  } else if (conn.type === "turso") {
    return conn.config.host;
  }

  return "";
}
