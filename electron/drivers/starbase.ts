import BaseDriver, { ColumnType, Result } from "./base";
import { transformArrayBasedResult } from "./transformer";

interface StarbaseResult {
  columns: string[];
  rows: unknown[][];
  meta: {
    rows_read: number;
    rows_written: number;
  };
}

interface StarbaseResponse {
  result: StarbaseResult | StarbaseResult[];
}

export default class StarbaseDriver implements BaseDriver {
  protected token: string;
  protected url: string;

  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }

  async init() {
    // do nothing
  }

  async close() {
    // do nothing
  }

  async query(stmt: string): Promise<Result> {
    const startTime = performance.now();
    const r = await fetch(`${this.url.replace(/\/$/, "")}/query/raw`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + (this.token ?? ""),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql: stmt }),
    });
    const endTime = performance.now();

    const json: StarbaseResponse = await r.json();
    const result = Array.isArray(json.result) ? json.result[0] : json.result;

    return {
      ...transformArrayBasedResult(
        result.columns,
        (header) => {
          return {
            name: header,
            displayName: header,
            originalType: null,
            type: ColumnType.TEXT,
          };
        },
        result.rows,
      ),
      stat: {
        queryDurationMs: (endTime - startTime) | 0,
        rowsAffected: result.meta.rows_written,
        rowsRead: result.meta.rows_read,
        rowsWritten: result.meta.rows_written,
      },
    };
  }

  async batch(stmts: string[]): Promise<Result[]> {
    const r = await fetch(`${this.url.replace(/\/$/, "")}/query/raw`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + (this.token ?? ""),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transaction: stmts.map((s) => ({ sql: s })) }),
    });

    const json: StarbaseResponse = await r.json();
    const results = Array.isArray(json.result) ? json.result : [json.result];

    return results.map((result) => {
      return {
        ...transformArrayBasedResult(
          result.columns,
          (header) => {
            return {
              name: header,
              displayName: header,
              originalType: null,
            };
          },
          result.rows,
        ),
        stat: {
          queryDurationMs: 0,
          rowsAffected: result.meta.rows_written,
          rowsRead: result.meta.rows_read,
          rowsWritten: result.meta.rows_written,
        },
      };
    });
  }
}
