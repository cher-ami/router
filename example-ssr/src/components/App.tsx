import React from "react";
import { Link, Stack } from "../../../src";

export function App() {
  const crossedTransitions = ({
    previousPage,
    currentPage,
    unmountPreviousPage,
  }): Promise<void> => {
    return new Promise(async (resolve) => {
      const $current = currentPage?.$element;
      if ($current) $current.style.visibility = "hidden";
      if (previousPage) {
        previousPage.playOut();
      }
      if (currentPage) {
        await currentPage.isReadyPromise();
        if ($current) $current.style.visibility = "visible";
        await currentPage.playIn();
        unmountPreviousPage();
      }
      resolve();
    });
  };

  return (
    <div className={"App"}>
      <nav>
        <Link to={{ name: "Home" }}>Home</Link> |{" "}
        <Link to={{ name: "About" }}>About</Link> |{" "}
        <Link to={{ name: "Article", params: { slug: "article-1" } }}>Article 1</Link> |{" "}
        <Link to={{ name: "Contact" }}>Contact</Link>
      </nav>
      <Stack manageTransitions={crossedTransitions} />
    </div>
  );
}
