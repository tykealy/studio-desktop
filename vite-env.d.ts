import { type OuterbaseIpc } from "./electron/preload";

declare module "docker-cli-js" {
  export class Docker {
    constructor(options?: Options);
    command(command: string): Promise<CommandResult>;
  }

  export interface Options {
    machineName?: string;
    currentWorkingDirectory?: string;
  }

  export interface CommandResult {
    raw: string;
  }
}

declare global {
  interface Window {
    outerbaseIpc: OuterbaseIpc;
  }

  namespace NodeJS {
    interface ProcessEnv {
      /**
       * The built directory structure
       *
       * ```tree
       * ├─┬─┬ dist
       * │ │ └── index.html
       * │ │
       * │ ├─┬ dist-electron
       * │ │ ├── main.js
       * │ │ └── preload.js
       * │
       * ```
       */
      APP_ROOT: string;
      /** /dist/ or /public/ */
      VITE_PUBLIC: string;
    }
  }
}
