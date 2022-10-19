import React, { useState, useRef, useContext } from "react";
import { useLang, useRouter, useStack } from "@cher-ami/router";
import { transitionsHelper } from "../helpers/transitionsHelper";
import { GlobalDataContext } from "../GlobalDataContext";

const componentName = "HomePage";
function HomePage(props, handleRef) {
  const rootRef = useRef(null);
  const [n, setN] = useState(0);
  const { globalData } = useContext(GlobalDataContext);
  const router = useRouter();
  const a = useLang();
  console.log(router);

  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn: () => transitionsHelper(rootRef.current, true, { x: -50 }, { x: 0 }),
    playOut: () => transitionsHelper(rootRef.current, false, { x: -0 }, { x: 50 }),
  });

  return (
    <div className={componentName} ref={rootRef}>
      {componentName}
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
