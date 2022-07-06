import React, {useState, useRef, useEffect} from "react"
import { useStack } from "../../../src"
import { transitionsHelper } from "../helpers/transitionsHelper"

const componentName = "HomePage"
function HomePage(props, handleRef) {
  const rootRef = useRef(null)
  const [n, setN] = useState(0)

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
    </div>
  )
}

export default React.forwardRef(HomePage)
