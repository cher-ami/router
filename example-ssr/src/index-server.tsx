import "isomorphic-unfetch";
import * as React from "react";
import ReactDOMServer from "react-dom/server";
import { routes } from "./routes";
import { App } from "./components/App";
import { getCurrentRoute, getStaticPropsFromRoute, LangService, Router } from "../../src";
import { GlobalDataContext } from "./GlobalDataContext";
import languages from "./languages";

export async function render(url: string) {
  // Prepare common
  const base = process.env.VITE_APP_BASE;
  const langService = new LangService({ staticLocation: url, languages });

  // Request static PROPS
  const SSR_STATIC_PROPS = await getStaticPropsFromRoute(
    getCurrentRoute(url, routes, base, langService)
  );

  // Request Global data example
  const globalData = async () => {
    const res = await fetch("https://jsonplaceholder.typicode.com/users");
    const users = await res.json();
    return { users };
  };
  let GLOBAL_DATA = await globalData();

  // Return template for server
  const renderToString = ReactDOMServer.renderToString(
    <Router
      base={base}
      routes={routes}
      staticLocation={url}
      initialStaticProps={SSR_STATIC_PROPS}
      langService={langService}
    >
      <GlobalDataContext.Provider value={{ globalData: GLOBAL_DATA }}>
        <App />
      </GlobalDataContext.Provider>
    </Router>
  );

  return {
    renderToString,
    ssrStaticProps: SSR_STATIC_PROPS,
    globalData: GLOBAL_DATA,
  };
}
