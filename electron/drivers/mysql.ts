import BaseDriver, { ColumnType, Result, ResultHeader } from "./base";
import { Pool, PoolConnection, SslOptions, createPool } from "mysql2/promise";

enum MySQLType {
  MYSQL_TYPE_DECIMAL,
  MYSQL_TYPE_TINY,
  MYSQL_TYPE_SHORT,
  MYSQL_TYPE_LONG,
  MYSQL_TYPE_FLOAT,
  MYSQL_TYPE_DOUBLE,
  MYSQL_TYPE_NULL,
  MYSQL_TYPE_TIMESTAMP,
  MYSQL_TYPE_LONGLONG,
  MYSQL_TYPE_INT24,
  MYSQL_TYPE_DATE,
  MYSQL_TYPE_TIME,
  MYSQL_TYPE_DATETIME,
  MYSQL_TYPE_YEAR,
  MYSQL_TYPE_NEWDATE /**< Internal to MySQL. Not used in protocol */,
  MYSQL_TYPE_VARCHAR,
  MYSQL_TYPE_BIT,
  MYSQL_TYPE_TIMESTAMP2,
  MYSQL_TYPE_DATETIME2 /**< Internal to MySQL. Not used in protocol */,
  MYSQL_TYPE_TIME2 /**< Internal to MySQL. Not used in protocol */,
  MYSQL_TYPE_TYPED_ARRAY /**< Used for replication only */,
  MYSQL_TYPE_INVALID = 243,
  MYSQL_TYPE_BOOL = 244 /**< Currently just a placeholder */,
  MYSQL_TYPE_JSON = 245,
  MYSQL_TYPE_NEWDECIMAL = 246,
  MYSQL_TYPE_ENUM = 247,
  MYSQL_TYPE_SET = 248,
  MYSQL_TYPE_TINY_BLOB = 249,
  MYSQL_TYPE_MEDIUM_BLOB = 250,
  MYSQL_TYPE_LONG_BLOB = 251,
  MYSQL_TYPE_BLOB = 252,
  MYSQL_TYPE_VAR_STRING = 253,
  MYSQL_TYPE_STRING = 254,
  MYSQL_TYPE_GEOMETRY = 255,
}

const mapDataName: Record<number, string> = {
  0x00: "DECIMAL", // aka DECIMAL
  0x01: "TINY", // aka TINYINT, 1 byte
  0x02: "SHORT", // aka SMALLINT, 2 bytes
  0x03: "LONG", // aka INT, 4 bytes
  0x04: "FLOAT", // aka FLOAT, 4-8 bytes
  0x05: "DOUBLE", // aka DOUBLE, 8 bytes
  0x06: "NULL", // NULL (used for prepared statements, I think)
  0x07: "TIMESTAMP", // aka TIMESTAMP
  0x08: "LONGLONG", // aka BIGINT, 8 bytes
  0x09: "INT24", // aka MEDIUMINT, 3 bytes
  0x0a: "DATE", // aka DATE
  0x0b: "TIME", // aka TIME
  0x0c: "DATETIME", // aka DATETIME
  0x0d: "YEAR", // aka YEAR, 1 byte (don't ask)
  0x0e: "NEWDATE", // aka ?
  0x0f: "VARCHAR", // aka VARCHAR (?)
  0x10: "BIT", // aka BIT, 1-8 byte
  0xf5: "JSON",
  0xf6: "NEWDECIMAL", // aka DECIMAL
  0xf7: "ENUM", // aka ENUM
  0xf8: "SET", // aka SET
  0xf9: "TINY_BLOB", // aka TINYBLOB, TINYTEXT
  0xfa: "MEDIUM_BLOB", // aka MEDIUMBLOB, MEDIUMTEXT
  0xfb: "LONG_BLOB", // aka LONGBLOG, LONGTEXT
  0xfc: "BLOB", // aka BLOB, TEXT
  0xfd: "VAR_STRING", // aka VARCHAR, VARBINARY
  0xfe: "STRING", // aka CHAR, BINARY
  0xff: "GEOMETRY", // aka GEOMETRY
};

function mapDataType(columnType: number): ColumnType {
  // List of all column type
  // https://dev.mysql.com/doc/dev/mysql-server/latest/field__types_8h_source.html
  if (columnType === MySQLType.MYSQL_TYPE_JSON) {
    return ColumnType.TEXT;
  } else if (
    [
      MySQLType.MYSQL_TYPE_TINY,
      MySQLType.MYSQL_TYPE_SHORT,

      MySQLType.MYSQL_TYPE_LONGLONG,
      MySQLType.MYSQL_TYPE_INT24,
      MySQLType.MYSQL_TYPE_BIT,
    ].includes(columnType)
  ) {
    return ColumnType.INTEGER;
  } else if (
    [
      MySQLType.MYSQL_TYPE_LONG,
      MySQLType.MYSQL_TYPE_FLOAT,
      MySQLType.MYSQL_TYPE_DOUBLE,
    ].includes(columnType)
  ) {
    return ColumnType.REAL;
  } else if (
    [MySQLType.MYSQL_TYPE_DECIMAL, MySQLType.MYSQL_TYPE_NEWDECIMAL].includes(
      columnType,
    )
  ) {
    return ColumnType.REAL;
  } else if (
    [
      MySQLType.MYSQL_TYPE_GEOMETRY,
      MySQLType.MYSQL_TYPE_MEDIUM_BLOB,
      MySQLType.MYSQL_TYPE_LONG_BLOB,
    ].includes(columnType)
  ) {
    return ColumnType.TEXT;
  } else if ([MySQLType.MYSQL_TYPE_DATE].includes(columnType)) {
    return ColumnType.TEXT;
  } else if (
    [MySQLType.MYSQL_TYPE_TIME, MySQLType.MYSQL_TYPE_TIME2].includes(columnType)
  ) {
    return ColumnType.TEXT;
  } else if (
    [
      MySQLType.MYSQL_TYPE_DATETIME,
      MySQLType.MYSQL_TYPE_DATETIME2,
      MySQLType.MYSQL_TYPE_TIMESTAMP,
      MySQLType.MYSQL_TYPE_TIMESTAMP2,
    ].includes(columnType)
  ) {
    return ColumnType.TEXT;
  }

  return ColumnType.TEXT;
}

interface ColumnDefinition {
  _buf: Buffer;
  _orgTableLength: number;
  _orgTableStart: number;
  _orgNameLength: number;
  _orgNameStart: number;
  type: number;
  typeName: string;
  name: string;
  flags: number;
}

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
    const [result, fieldsets] = await conn.query(statement);

    // If it is not an array, it means
    // it is not a SELECT statement
    if (!Array.isArray(result)) {
      return {
        headers: [],
        rows: [],
        stat: {
          queryDurationMs: null,
          rowsAffected: result.affectedRows,
          rowsRead: null,
          rowsWritten: null,
        },
        lastInsertRowid: result.insertId,
      };
    }

    const headerSet = new Set();
    const headers = (fieldsets as unknown as ColumnDefinition[]).map(
      (raw): ResultHeader => {
        let renameColName = raw.name;

        for (let i = 0; i < 20; i++) {
          if (!headerSet.has(renameColName)) break;
          renameColName = `__${raw.name}_${i}`;
        }

        return {
          displayName: raw.name,
          name: renameColName,
          originalType: (mapDataName[raw.type] ?? "text").toLowerCase(),
          type: mapDataType(raw.type),
        };
      },
    );

    const rows = (result as unknown[][]).map((resultRow) => {
      return headers.reduce(
        (row, header, idx) => {
          const value = resultRow[idx];
          if (value !== null) {
            if (header.originalType === "json") {
              row[header.name] = JSON.stringify(value as string);
            } else if (
              header.originalType === "blob" ||
              header.originalType === "medium_blob" ||
              header.originalType === "long_blob" ||
              header.originalType === "tiny_blob"
            ) {
              if (typeof value === "string") {
                row[header.name] = value;
              } else {
                row[header.name] = [...new Uint8Array(value as Buffer)];
              }
            } else if (header.originalType === "geometry") {
              const point = value as { x: number; y: number };
              if (!Array.isArray(point) && point.x !== undefined) {
                row[header.name] = `POINT(${point.x} ${point.y})`;
              } else {
                row[header.name] = value;
              }
            } else {
              row[header.name] = value;
            }
          } else {
            row[header.name] = value;
          }

          return row;
        },
        {} as Record<string, unknown>,
      );
    });

    return {
      headers,
      rows,
      stat: {
        queryDurationMs: null,
        rowsAffected: null,
        rowsRead: null,
        rowsWritten: null,
      },
      lastInsertRowid: undefined,
    };
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
