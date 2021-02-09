import React, { useEffect } from "react";
import { Link, useRouteCounter, Stack, useHistory } from "../src";

const componentName = "App";
const debug = require("debug")(`router:${componentName}`);

/**
 * @name App
 */
export default function App() {
  const history = useHistory();
  useEffect(() => {
    debug("history", history);
  }, [history]);

  const count = useRouteCounter();
  useEffect(() => {
    debug("count", count);
  }, [count]);

  return (
    <div className={componentName}>
      <nav>
        <ul>
          <li>
            <Link to={"/"}>Home</Link>{" "}
          </li>
          <li>
            <Link to={"/about"}>About</Link>{" "}
          </li>
          <li>
            <Link to={"/blog/article-1"}>Blog id:article-1</Link>
          </li>
        </ul>
      </nav>
      <Stack className={"App_stack"} />
    </div>
  );
}
