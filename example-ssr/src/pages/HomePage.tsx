import React, {useState, useRef, useEffect, useContext} from "react"
import { useStack } from "../../../src"
import { transitionsHelper } from "../helpers/transitionsHelper"
import {GlobalDataContext} from "../GlobalDataContext";

const componentName = "HomePage"
function HomePage(props, handleRef) {
  const rootRef = useRef(null)
  const [n, setN] = useState(0)
    const {globalData} = useContext(GlobalDataContext)

    console.log('HOME props ', props)
    console.log("Global data", globalData)

  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn: () => transitionsHelper(rootRef.current, true, { x: -50 }, { x: 0 }),
    playOut: () => transitionsHelper(rootRef.current, false, { x: -0 }, { x: 50 }),
  })

  return (
    <div className={componentName} ref={rootRef}>
      HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME
      HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME
      HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME
      HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME HOME
      <br />
      <button onClick={() => setN(n + 1)}>+ {n}</button>
        {globalData.users.map((user,i) => <p key={i}>{user.name}</p>)}
    </div>
  )
}

export default React.forwardRef(HomePage)
