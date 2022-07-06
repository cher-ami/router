import * as React from "react";
import ReactDOMServer from "react-dom/server";
import { routes } from "./routes";
import { App } from "./components/App";
import { Router, TRoute } from "../../src";
import { getNotFoundRoute, getRouteFromUrl } from "../../src/core/matcher";
import "./fetch-polyfill";
import { formatRoutes } from "../../src/core/helpers";
import { GlobalDataContext } from "./GlobalDataContext";

export async function render(url) {
  /**
   * 1. savoir quel composant je dois rendre dans mon router
   */
  const matchingRoute = getRouteFromUrl({
    pUrl: url,
    pBase: "/",
    pRoutes: formatRoutes(routes),
  });
  const notFoundRoute = getNotFoundRoute(routes);
  if (!matchingRoute && !notFoundRoute) {
    console.error("matchingRoute not found & 'notFoundRoute' not found, return.");
    return;
  }
  const route: TRoute = matchingRoute || notFoundRoute;
  /**
   * 2. executer cette action async
   */
  let SSR_STATIC_PROPS = {
    props: null,
    name: route.name,
  };

  if (route?.getStaticProps) {
    try {
      SSR_STATIC_PROPS.props = await route.getStaticProps(route.props);
    } catch (e) {
      console.error("fetch action data error");
    }
  }

  // Get Global data
  const requestGlobal = async () => {
    const res = await fetch("https://jsonplaceholder.typicode.com/users")
    const users = await res.json();
    return {users}
  }

 const GLOBAL_DATA = await requestGlobal()

  /**
   * 3. Retourner la réponse (dans le template)
   */
  return {
    renderToString: ReactDOMServer.renderToString(

      <Router routes={routes} staticLocation={url} initialStaticProps={SSR_STATIC_PROPS}>
        {/* Provide Global data */}
        <GlobalDataContext.Provider value={{globalData: GLOBAL_DATA}}>
          <App/>
        </GlobalDataContext.Provider>
      </Router>
    ),
    ssrStaticProps: SSR_STATIC_PROPS,
    globalData: GLOBAL_DATA
  };
}
