/// <reference types="vite/client" />
/// <reference types="vite-plugin-pages/client" />
/// <reference types="vite-plugin-vue-layouts/client" />

interface ImportMetaEnv {
  readonly VITE_NODE_ENV: string
  readonly VITE_APP_URL: string
  readonly VITE_APP_URL_NEWS: string
  readonly VITE_APP_BJ_API: string
  readonly VITE_PRIMARY_DOMAIN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'virtual:svg-icons-register' {
  const component: unknown
  export default component
}
