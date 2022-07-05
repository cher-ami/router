import React, {useEffect, useRef} from "react"
import { useStack } from "../../../src"
import { transitionsHelper } from "../helpers/transitionsHelper"
import pic from "../assets/pic.png"
import css from "./AboutPage.module.css"
import {useGetStaticProps} from "../helpers/useGetStaticProps"

const componentName = "AboutPage"
function AboutPage(props, handleRef) {
  const rootRef = useRef(null)
  console.log('ABOUT props ', props)

  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn: () => transitionsHelper(rootRef.current, true, { x: -50 }, { x: 0 }),
    playOut: () => transitionsHelper(rootRef.current, false, { x: -0 }, { x: 50 }),
  })

  return (
    <div className={[componentName, css.root].filter((e) => e).join(" ")} ref={rootRef}>
      {componentName}
      <br />
      <br />
      <img src={pic} alt="pic" width={150} />
      <p>
        ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT
        ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT
        ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT
        ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT
      </p>

      {props.todo?.map((e, i) => <div key={i}>{e.title}</div>)}
    </div>
  )
}

export default React.forwardRef(AboutPage)
