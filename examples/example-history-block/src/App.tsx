import { Link, Stack, useRouter } from "@cher-ami/router"
import { useRef, useState } from "react"

export function App() {
  const { history } = useRouter()
  const unblockRef = useRef<any>()
  const [isBlock, setIsBlock] = useState(false)

  const crossedTransitions = ({
    previousPage,
    currentPage,
    unmountPreviousPage,
  }: any): Promise<void> =>
    new Promise(async (resolve) => {
      const $current = currentPage?.$element
      if ($current) $current.style.visibility = "hidden"
      if (previousPage) {
        previousPage.playOut?.()
      }
      if (currentPage) {
        if ($current) $current.style.visibility = "visible"
        await currentPage.playIn?.()
        unmountPreviousPage()
      }
      resolve()
    })

  return (
    <div key={`${isBlock}`}>
      <nav>
        <Link to={"/a"}>A</Link>
        <Link to={"/b"}>B</Link>
      </nav>

      <section>
        <button
          onClick={() => {
            setIsBlock(true)
            unblockRef.current = history!.block(() => {
              console.log("blocked")
            })
          }}
        >
          block history
        </button>
        <br />
        <button
          onClick={() => {
            setIsBlock(false)
            unblockRef.current?.()
          }}
        >
          unblock history
        </button>
      </section>

      <div key={`${isBlock}`}>History is blocked: {isBlock ? "true" : "false"}</div>

      <Stack manageTransitions={crossedTransitions} />
    </div>
  )
}
