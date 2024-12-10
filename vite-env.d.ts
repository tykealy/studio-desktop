import { type OuterbaseIpc } from "./electron/preload";
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
