import { Client, createClient } from "@libsql/client";
import { transformTursoResult } from "@outerbase/sdk-transform";
import BaseDriver, { Result } from "./base";

function escapeSqlString(str: string) {
  return `'${str.replace(/'/g, `''`)}'`;
}

export default class TursoDriver implements BaseDriver {
  protected db: Client;
  protected attach?: Record<string, string>;

  constructor(config: {
    url: string;
    token?: string;
    attach?: Record<string, string>;
  }) {
    this.attach = config.attach;

    this.db = createClient({
      url: config.url,
      authToken: config.token,
      intMode: "number",
    });
  }

  async init() {
    if (this.attach) {
      for (const [alias, file] of Object.entries(this.attach)) {
        await this.db.execute(
          `ATTACH DATABASE ${escapeSqlString(file)} AS ${escapeSqlString(
            alias,
          )}`,
        );
      }
    }

    return;
  }

  async query(statement: string): Promise<Result> {
    return transformTursoResult(await this.db.execute(statement));
  }

  async batch(statements: string[]): Promise<Result[]> {
    return (await this.db.batch(statements)).map(transformTursoResult);
  }

  async close() {
    // do nothing
  }

  async connect() {
    // do nothing
  }
}
