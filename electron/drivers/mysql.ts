import BaseDriver, { Result } from "./base";
import { transformMySQLResult } from "@outerbase/sdk-transform";
import { Pool, PoolConnection, SslOptions, createPool } from "mysql2/promise";

export interface MySqlConnectionConfig {
  database: string;
  user: string;
  password: string;
  host: string;
  port: number;
  ssl?: SslOptions;
}

export default class MySQLDriver implements BaseDriver {
  db?: Pool;
  connectionString: MySqlConnectionConfig;
  keepAliveTimer: NodeJS.Timeout | null = null;
  isPinging = false;

  constructor(connectionString: MySqlConnectionConfig) {
    this.connectionString = connectionString;
  }

  async close() {
    if (this.db) {
      await this.db.end();
    }

    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
    }
  }

  protected async getConnection() {
    if (this.db) return this.db;
    this.db = createPool({
      ...this.connectionString,
      rowsAsArray: true,
      dateStrings: true,
      pool: { min: 1, max: 1 },
      connectionLimit: 1,
      enableKeepAlive: true,
    });

    this.keepAliveTimer = setInterval(() => {
      if (this.isPinging) return;

      this.isPinging = true;
      this.db
        ?.getConnection()
        .then((conn) => {
          conn.ping();
          conn.release();
        })
        .catch(console.error)
        .finally(() => {
          this.isPinging = false;
        });
    }, 6000);

    return this.db;
  }

  async init() {
    return;
  }

  async execute(
    conn: Pool | PoolConnection,
    statement: string,
  ): Promise<Result> {
    return transformMySQLResult(await conn.query(statement));
  }

  async query(statement: string): Promise<Result> {
    const conn = await this.getConnection();
    return await this.execute(conn, statement);
  }

  async batch(statements: string[]): Promise<Result[]> {
    const pool = await this.getConnection();
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const resultCollection: Result[] = [];

      for (const statement of statements) {
        resultCollection.push(await this.execute(conn, statement));
      }

      await conn.commit();
      pool.releaseConnection(conn);
      return resultCollection;
    } catch (e) {
      console.log(e);
      await conn.rollback();
      pool.releaseConnection(conn);
      if (e instanceof Error) {
        throw new Error(e.message);
      } else {
        throw new Error(String(e));
      }
    }
  }
}
