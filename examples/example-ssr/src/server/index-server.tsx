import fetch from "cross-fetch"
import * as React from "react"
import { routes } from "~/routes"
import { App } from "~/components/App"
import { languages, showDefaultLangInUrl } from "~/languages"
import { LangService, requestStaticPropsFromRoute, Router } from "@cher-ami/router"
import { loadEnv } from "vite"
import { TScriptsObj } from "../../prerender/helpers/ManifestParser"
import { CherScripts } from "~/server/helpers/CherScripts"
import { RawScript } from "~/server/helpers/RawScript"
import { ViteDevScripts } from "~/server/helpers/ViteDevScripts"
import { ReactElement } from "react"
import { preventSlashes } from "~/server/helpers/preventSlashes"
import { GlobalDataContext } from "~/store/GlobalDataContext"

// ----------------------------------------------------------------------------- PREPARE

/**
 * Server render
 * @param url
 * @param isPrerender
 * @param scripts
 */
// prettier-ignore
export async function render(
  url: string,
  scripts: TScriptsObj,
  isPrerender = false
): Promise<ReactElement> {

  if (url === "/@vite-plugin-checker-runtime") return

  // prepare base & URL
  const base = process.env.VITE_APP_BASE || loadEnv("", process.cwd(), "").VITE_APP_BASE || '/'
  url = preventSlashes(`${isPrerender ? base : ""}${url}`)

  // Init lang service
  const langService = new LangService({
    staticLocation: url,
    showDefaultLangInUrl,
    languages,
    base,
  })


  // Request static props
  const ssrStaticProps = await requestStaticPropsFromRoute({ url, base, routes, langService, id:"1-RSP" })
  const meta = ssrStaticProps?.props?.meta

  // Request Global data example-client
  const requestGlobalData = async () => {
    const res = await fetch("https://jsonplaceholder.typicode.com/users");
    const users = await res.json();
    return { users };
  };
  const globalData = await requestGlobalData();


  return (
    <html lang={langService.currentLang.key} data-is404={ssrStaticProps?.props?.notFound ? "true" : null}>
      <head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="x-ua-compatible" content="IE=Edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <title>{meta?.title || "app"}</title>
        <meta name="description" content={meta?.description} />
        <link rel="canonical" href={meta?.url || url} />
        <ViteDevScripts />
        <CherScripts scripts={scripts.css} />
        <CherScripts scripts={scripts.woff2} />
      </head>

      <body>
        <div id="root">
          <Router
            base={base}
            routes={routes}
            langService={langService}
            staticLocation={url}
            initialStaticProps={ssrStaticProps}
            id={1}
          >
            <GlobalDataContext.Provider value={globalData}>
            <App is404={ssrStaticProps?.props?.notFound}/>
            </GlobalDataContext.Provider>
          </Router>
        </div>

        <CherScripts scripts={scripts.js} />
        <RawScript name={"__SSR_STATIC_PROPS__"} data={ssrStaticProps} />
        <RawScript name={"__GLOBAL_DATA__"} data={globalData ?? {}} />
      </body>
    </html>
  )
}
