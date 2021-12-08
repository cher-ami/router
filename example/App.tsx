import React from "react";
import { Link, Routers, Stack, useLang } from "../src";

const componentName = "App";

/**
 * @name App
 */
export default function App() {
  const [lang, setLang] = useLang();
  return (
    <div className={componentName}>
      {["en", "fr", "de", "nl"].map((el, i) => (
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
      <Stack className={"App_stack"} />
    </div>
  );
}
