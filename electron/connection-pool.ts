import { ConnectionStoreItem } from "@/lib/conn-manager-store";
import BaseDriver from "./drivers/base";
import MySQLDriver from "./drivers/mysql";
import TursoDriver from "./drivers/sqlite";
import PostgresDriver from "./drivers/postgres";
import StarbaseDriver from "./drivers/starbase";
import CloudflareDriver from "./drivers/cloudflare";

export class ConnectionPool {
  static connections: Record<string, BaseDriver> = {};

  static create(conn: ConnectionStoreItem) {
    if (ConnectionPool.connections[conn.id]) {
      throw new Error(`Connection already exists: ${conn.id}`);
    }

    switch (conn.type) {
      case "mysql":
        ConnectionPool.connections[conn.id] = new MySQLDriver({
          host: conn.config.host,
          port: Number(conn.config.port || "3306"),
          user: conn.config.username || "root",
          password: conn.config.password || "",
          database: conn.config.database || "",
          ssl: conn.config.ssl ? { rejectUnauthorized: false } : undefined,
        });
        break;
      case "sqlite":
        ConnectionPool.connections[conn.id] = new TursoDriver({
          url: "file:" + conn.config.host,
        });
        break;
      case "starbase":
        ConnectionPool.connections[conn.id] = new StarbaseDriver(
          conn.config.host,
          conn.config.password!,
        );
        break;
      case "turso":
        ConnectionPool.connections[conn.id] = new TursoDriver({
          url: conn.config.host,
          token: conn.config.password,
        });
        break;
      case "cloudflare":
        ConnectionPool.connections[conn.id] = new CloudflareDriver({
          url: conn.config.host,
          accountId: conn.config.username!,
          databaseId: conn.config.database!,
          token: conn.config.password!,
        });
        break;
      case "postgres":
        ConnectionPool.connections[conn.id] = new PostgresDriver({
          user: conn.config.username || "postgres",
          host: conn.config.host,
          database: conn.config.database || "postgres",
          password: conn.config.password || "",
          port: Number(conn.config.port || "5432"),
          ssl: conn.config.ssl
            ? {
                rejectUnauthorized: false,
              }
            : undefined,
        });
        break;
      default:
        throw new Error(`Unsupported connection type: ${conn.type}`);
    }
  }

  static close(connectionId: string) {
    const conn = ConnectionPool.connections[connectionId];
    if (!conn) {
      throw new Error(`Connection not found: ${connectionId}`);
    }

    conn.close();
    delete ConnectionPool.connections[connectionId];
  }

  static query(connectionId: string, query: string) {
    const conn = ConnectionPool.connections[connectionId];
    if (!conn) {
      throw new Error(`Connection not found: ${connectionId}`);
    }

    return conn.query(query);
  }

  static batch(connectionId: string, query: string[]) {
    const conn = ConnectionPool.connections[connectionId];
    if (!conn) {
      throw new Error(`Connection not found: ${connectionId}`);
    }

    return conn.batch(query);
  }
}
