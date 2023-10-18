import React, { useState, useRef, useContext, useEffect } from "react";
import { useLang, useStack } from "@cher-ami/router";
import { transitionsHelper } from "~/helpers/transitionsHelper";
import { GlobalDataContext } from "~/store/GlobalDataContext";

const componentName = "HomePage";
function HomePage(props, handleRef) {
  const rootRef = useRef(null);
  const [n, setN] = useState(0);
  const globalData = useContext(GlobalDataContext);
//    console.log("globalData",globalData)
  const [lang] = useLang();

  useEffect(()=>
  {
  },[])

  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn: () => transitionsHelper(rootRef.current, true, { x: -50 }, { x: 0 }),
    playOut: () => transitionsHelper(rootRef.current, false, { x: -0 }, { x: 50 }),
  });

  return (
    <div className={componentName} ref={rootRef}>
      {componentName} {lang.key}
      <br />
      <br />
      <button onClick={() => setN(n + 1)}>+ {n}</button>
      <br />
      <br />
      <p>"globalData" request result:</p>
      {globalData.users.map((user, i) => (
        <div key={i}>{user.name}</div>
      ))}
    </div>
  );
}

export default React.forwardRef(HomePage);
