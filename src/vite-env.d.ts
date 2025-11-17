/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Also support Node.js process.env for scripts
declare namespace NodeJS {
  interface ProcessEnv {
    VITE_SUPABASE_URL: string
    VITE_SUPABASE_ANON_KEY: string
  }
}
