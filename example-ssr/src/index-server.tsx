import "isomorphic-unfetch";
import * as React from "react";
import ReactDOMServer from "react-dom/server";
import { routes } from "./routes";
import { App } from "./components/App";
import {
  getCurrentRoute,
  requestStaticPropsFromRoute,
  LangService,
  Router,
} from "../../src";
import { GlobalDataContext } from "./GlobalDataContext";
import languages from "./languages";
import { formatRoutes } from "../../src/core/helpers";

export async function render(url: string) {
  // Prepare common
  const base = process.env.VITE_APP_BASE;
  const langService = new LangService({ staticLocation: url, languages });
  const formattedRoutes =  formatRoutes(routes, langService, null)

  // Request static props
  const SSR_STATIC_PROPS = await requestStaticPropsFromRoute(
    getCurrentRoute({ url, base, routes: formattedRoutes })
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
