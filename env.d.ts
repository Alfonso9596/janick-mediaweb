/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PRIME_LICENSE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
