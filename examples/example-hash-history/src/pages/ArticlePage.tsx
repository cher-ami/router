import React, { ForwardedRef, forwardRef, useEffect, useRef } from "react"
import { useLang, useLocation } from "@cher-ami/router"
import { useStack } from "@cher-ami/router"
import { transitionsHelper } from "../helper/transitionsHelper"
import debug from "@cher-ami/debug"

interface IProps {
  params?: {
    id: string
  }
  time: {
    datetime: string
  }
}

const componentName = "ArticlePage"
const log = debug(`router:${componentName}`)

/**
 * @name ArticlePage
 */
export const ArticlePage = forwardRef((props: IProps, handleRef: ForwardedRef<any>) => {
  const rootRef = useRef(null)
  const [lang] = useLang()

  const [location, setLocation] = useLocation()

  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn: () => transitionsHelper(rootRef.current, true, { x: -50 }, { x: 0 }),
    playOut: () => transitionsHelper(rootRef.current, false, { x: -0 }, { x: 50 }),
  })

  useEffect(() => {
    log("props.time", props.time)
  }, [props.time])
  return (
    <div className={componentName} ref={rootRef}>
      <h1>
        {componentName} - id: {props?.params?.id} - {lang.key}
      </h1>
      <br />
      <div>fetch props datetime: {props.time?.datetime}</div>
      <br />
      <br />
      <button
        onClick={() => {
          setLocation("/")
        }}
      >
        navigate to /
      </button>
      <code>{`  setLocation("/")`}</code>
      <br />
      <button
        onClick={() => {
          setLocation({ name: "ArticlePage", params: { id: "hello" } })
        }}
      >
        {`navigate to ArticlePage`}
      </button>
      <code>{`  setLocation({ name: "ArticlePage", params: { id: "hello" } })`}</code>
      <br />
    </div>
  )
})

ArticlePage.displayName = componentName
export default ArticlePage
