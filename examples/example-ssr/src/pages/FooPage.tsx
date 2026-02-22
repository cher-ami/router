import React, { ForwardedRef, useRef } from "react"
import { useRouter, useStack } from "@cher-ami/router"
import { transitionsHelper } from "../helpers/transitionsHelper"
import { useLang } from "@cher-ami/router"

const componentName = "FooPage"
interface IProps {
  todo: any
}
function FooPage(props: IProps, handleRef: ForwardedRef<any>) {
  const rootRef = useRef(null)
  const [lang] = useLang()
  const router = useRouter()

  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn: () => transitionsHelper(rootRef.current, true, { x: -50 }, { x: 0 }),
    playOut: () => transitionsHelper(rootRef.current, false, { x: -0 }, { x: 50 }),
  })

  return (
    <div className={"foo"} ref={rootRef}>
      {componentName} - langKey: - <span>{props?.todo?.title}</span>
      {router.langService && router.langService.currentLang.key}
    </div>
  )
}

export default React.forwardRef(FooPage)
