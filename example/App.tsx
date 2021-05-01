import React from "react";
import { Link, Stack } from "../src";

const componentName = "App";
const debug = require("debug")(`router:${componentName}`);

/**
 * @name App
 */
export default function App() {
  return (
    <div>
      <nav>
        <Link to={"/"}>Home</Link>
        <br />
        <Link to={"/about"}>About</Link>
      </nav>
      <Stack className={"App_stack"} />
    </div>
  );
}
