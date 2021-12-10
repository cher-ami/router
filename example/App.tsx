import React from "react";
import { Link, Stack, TManageTransitions, useLang } from "../src";
const componentName = "App";

/**
 * @name App
 */
export default function App() {
  const [lang, setLang] = useLang();

  const customSenario = ({
    previousPage,
    currentPage,
    unmountPreviousPage,
  }: TManageTransitions): Promise<void> => {
    return new Promise(async (resolve) => {
      const $currentPageElement = currentPage?.$element;
      if ($currentPageElement) {
        $currentPageElement.style.visibility = "hidden";
      }
      if (previousPage) previousPage.playOut();
      await currentPage?.isReadyPromise();
      if ($currentPageElement) {
        $currentPageElement.style.visibility = "visible";
      }
      await currentPage.playIn();
      resolve();
    });
  };

  return (
    <div className={componentName}>
      {["en", "fr", "de"].map((el, i) => (
        <button
          key={i}
          children={el}
          onClick={() => {
            setLang(el, true);
          }}
        />
      ))}
      <nav>
        <ul>
          <li>
            <Link to={{ name: "HomePage" }}>Home</Link>
          </li>
          <li>
            <Link to={{ name: "ArticlePage", params: { id: "article-1" } }}>
              Blog id:article-1
            </Link>
          </li>
          <li>
            <Link to={{ name: "AboutPage" }}>About (has sub router)</Link>
          </li>
        </ul>
      </nav>
      <Stack className={"App_stack"} manageTransitions={customSenario} />
    </div>
  );
}
