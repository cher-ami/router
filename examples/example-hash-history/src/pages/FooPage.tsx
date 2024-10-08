import React, { ForwardedRef, forwardRef, useRef } from "react"
import { Link, useLang, useStack } from "@cher-ami/router"
import { transitionsHelper } from "../helper/transitionsHelper"
const componentName: string = "FooPage"

interface IProps {}

const FooPage = forwardRef((props: IProps, handleRef: ForwardedRef<any>) => {
  const rootRef = useRef(null)
  const [lang] = useLang()

  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn: () =>
      transitionsHelper(rootRef.current, true, { y: -50, autoAlpha: 1 }, { y: 0 }),
    playOut: () =>
      transitionsHelper(rootRef.current, false, { y: -0 }, { y: 50, autoAlpha: 0 }),
  })

  return (
    <div className={componentName} ref={rootRef}>
      <h2>
        {componentName} - {lang.key}
      </h2>
      <br />
      <Link to={{ name: "ArticlePage", params: { id: "coucou" } }}>Article</Link>
      <br />
      <Link to={{ name: "AboutPage" }}>About</Link>
    </div>
  )
})

FooPage.displayName = componentName
export default FooPage
