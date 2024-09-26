import React, { ForwardedRef, forwardRef, useRef } from "react"
import { Link, useLang, useLocation, useStack } from "@cher-ami/router"
import { transitionsHelper } from "../helper/transitionsHelper"
const componentName: string = "OurPage"

interface IProps {}

const OurPage = forwardRef((props: IProps, handleRef: ForwardedRef<any>) => {
  const rootRef = useRef(null)
  const [lang] = useLang()

  const [location, setLocation] = useLocation()

  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn: () => transitionsHelper(rootRef.current, true),
    playOut: () => transitionsHelper(rootRef.current, false),
  })

  return (
    <div className={componentName} ref={rootRef}>
      <h2>
        {componentName} - {lang.key}
      </h2>
      <br />
      {/* <button
        children={`navigate to FooPage`}
        onClick={() => setLocation({ name: "FooPage" })}
      /> */}

      <Link to={{ name: "FooPage" }} children={`navigate to FooPage`} />
    </div>
  )
})

OurPage.displayName = componentName
export default OurPage
