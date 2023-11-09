import React, { useEffect } from "react"
import { Link, Stack, useLang } from "@cher-ami/router"
import { languages } from "~/languages"
import { EPages } from "~/routes"
import { useRouter } from "@cher-ami/router"

export function App() {
  const { langService } = useRouter()
  const [lang, setLang] = useLang()

  const crossedTransitions = ({
    previousPage,
    currentPage,
    unmountPreviousPage,
  }): Promise<void> => {
    return new Promise(async (resolve) => {
      const $current = currentPage?.$element
      if ($current) $current.style.visibility = "hidden"
      if (previousPage) {
        previousPage.playOut()
      }
      if (currentPage) {
        await currentPage.isReadyPromise()
        if ($current) $current.style.visibility = "visible"
        await currentPage.playIn()
        unmountPreviousPage()
      }
      resolve()
    })
  }

  // prettier-ignore
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


      {/* NAV */}
      {/*<nav>*/}
      {/*  <Link to={{ name: EPages.HOME }}>Home</Link> |{" "}*/}
      {/*  <Link to={{ name: EPages.ABOUT }}>About</Link> |{" "}*/}
      {/*  <Link to={{ name: EPages.ARTICLE, params: { slug: "article-1" } }}>Article 1</Link> |{" "}*/}
      {/*  <Link to={{ name: EPages.ARTICLE, params: { slug: "article-2" } }}>Article 2</Link> |{" "}*/}
      {/*  <Link to={{ name: EPages.CONTACT,  queryParams: {foo: "bar", "zoo": "ok" }, hash: "yo" }}>Contact</Link>*/}
      {/*</nav>*/}

      {/* RENDER PAGES */}
      <Stack manageTransitions={crossedTransitions} />
    </div>
  );
}
