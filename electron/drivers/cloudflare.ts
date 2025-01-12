import { transformCloudflareD1 } from "@outerbase/sdk-transform";
import { Result } from "./base";

interface CloudflareResult {
  results: {
    columns: string[];
    rows: unknown[][];
  };
  meta: {
    duration: number;
    changes: number;
    last_row_id: number;
    rows_read: number;
    rows_written: number;
  };
}

interface CloudflareResponse {
  errors?: { message: string }[];
  result: CloudflareResult[];
}

interface CloudflareDriverOptions {
  url: string;
  accountId: string;
  databaseId: string;
  token: string;
}

export default class CloudflareDriver {
  protected options: CloudflareDriverOptions;

  constructor(options: CloudflareDriverOptions) {
    this.options = options;
  }

  async init() {
    // do nothing
  }

  async close() {
    // do nothing
  }

  async query(stmt: string): Promise<Result> {
    return (await this.batch([stmt]))[0];
  }

  async batch(stmts: string[]): Promise<Result[]> {
    const r = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.options.accountId}/d1/database/${this.options.databaseId}/raw`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + this.options.token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql: stmts.join(";") }),
      },
    );

    const json: CloudflareResponse = await r.json();
    console.log(json);

    if (json?.errors && json.errors.length > 0) {
      throw new Error(json.errors[0].message);
    }

    return json.result.map(transformCloudflareD1);
  }
}
