import React from "react"
import { Link, Stack } from "../../../src"

export function App() {
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

  return (
    <div className={"App"}>
      <nav>
        <Link to="/">Home</Link> | <Link to="/about">About</Link> |{" "} | <Link to="/article/my-article-1">Article 1</Link> |{" "}
        <Link to="/contact">Contact</Link>
      </nav>
      <Stack manageTransitions={crossedTransitions} />
    </div>
  )
}
