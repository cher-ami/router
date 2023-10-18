import * as React from "react"

export const ViteDevScripts = () => {
  if (process.env.NODE_ENV !== "development") return null
  const base = process.env.VITE_APP_BASE || "/"
  return (
    <>
      {/* typescript plugin */}
      <script
        type="module"
        dangerouslySetInnerHTML={{
          __html: `
          import { inject } from "/@vite-plugin-checker-runtime";
          inject({ overlayConfig: {}, base: "${base}"});`,
        }}
      />

      {/* vite HMR */}
      <script type="module" src="/@vite/client"></script>

      {/* react plugin HMR */}
      <script
        type="module"
        dangerouslySetInnerHTML={{
          __html: `
          import refresh from '/@react-refresh'
          refresh.injectIntoGlobalHook(window)        
          window.$RefreshReg$ = () => {}
          window.$RefreshSig$ = () => (type) => type
          window.__vite_plugin_react_preamble_installed__ = true`,
        }}
      />
    </>
  )
}
