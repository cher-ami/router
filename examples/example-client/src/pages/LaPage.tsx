import React, { ForwardedRef, forwardRef, useRef } from "react"
import { useLang, useStack } from "@cher-ami/router"
import { transitionsHelper } from "../helper/transitionsHelper"
const componentName: string = "LaPage"

interface IProps {
  todo: any
}

const LaPage = forwardRef((props: IProps, handleRef: ForwardedRef<any>) => {
  const rootRef = useRef(null)
  const [lang] = useLang()

  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn: () => transitionsHelper(rootRef.current, true),
    playOut: () => transitionsHelper(rootRef.current, false),
  })

  return (
    <div className={componentName} ref={rootRef}>
      {props.todo.title}
      <h2>
        {componentName} - {lang.key}
      </h2>
    </div>
  )
})

LaPage.displayName = componentName
export default LaPage
