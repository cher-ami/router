import "isomorphic-unfetch";
import * as React from "react";
import ReactDOMServer from "react-dom/server";
import { routes } from "./routes";
import { App } from "./components/App";
import { requestStaticPropsFromRoute, LangService, Router } from "@cher-ami/router";
import { GlobalDataContext } from "./GlobalDataContext";
import languages from "./languages";

export async function render(url: string) {
  // Prepare common
  const base = process.env.VITE_APP_BASE;
  const langService = new LangService({
    showDefaultLangInUrl: true,
    staticLocation: url,
    languages,
    base,
  });

  // Request static props
  const ssrStaticProps = await requestStaticPropsFromRoute({
    url,
    base,
    routes,
    langService,
  });

  // Request Global data example-client
  const requestGlobalData = async () => {
    const res = await fetch("https://jsonplaceholder.typicode.com/users");
    const users = await res.json();
    return { users };
  };
  let globalData = await requestGlobalData();

  // Template for server
  const renderToString = ReactDOMServer.renderToString(
    <Router
      base={base}
      routes={routes}
      staticLocation={url}
      initialStaticProps={ssrStaticProps}
      langService={langService}
    >
      <GlobalDataContext.Provider value={{ globalData }}>
        <App />
      </GlobalDataContext.Provider>
    </Router>
  );

  return {
    renderToString,
    ssrStaticProps,
    globalData,
    languages: langService.languages,
  };
}
