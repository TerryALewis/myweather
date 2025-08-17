/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL: string;
  readonly VITE_ECOWITT_API_KEY: string;
  readonly VITE_ECOWITT_APPLICATION_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
