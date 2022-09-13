import React from "react";
import { Link, Stack, useLang } from "@cher-ami/router";
import languages from "../languages";

export function App() {
  const [lang, setLang] = useLang();

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
      {languages.map((el, i) => (
        <button
          key={i}
          children={el.key}
          onClick={() => {
            setLang(el, true);
          }}
        />
      ))}
      <br/>
      <br/>
      <nav>
        <Link to={{ name: "Home" }}>Home</Link> |{" "}
        <Link to={{ name: "About" }}>About</Link> |{" "}
        <Link to={{ name: "Article", params: { slug: "article-1" } }}>Article 1</Link> |{" "}
        <Link to={{ name: "Article", params: { slug: "article-2" } }}>Article 2</Link> |{" "}
        <Link to={{ name: "Contact" }}>Contact</Link>
      </nav>
      <Stack manageTransitions={crossedTransitions} />
    </div>
  );
}
