import React, { useRef } from "react";
import { useStack } from "@cher-ami/router";
import { transitionsHelper } from "../helpers/transitionsHelper";
import pic from "../assets/pic.png";


const componentName = "AboutPage";
function AboutPage(props, handleRef) {
  const rootRef = useRef(null);

  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn: () => transitionsHelper(rootRef.current, true, { x: -50 }, { x: 0 }),
    playOut: () => transitionsHelper(rootRef.current, false, { x: -0 }, { x: 50 }),
  });

  return (
    <div className={[componentName].filter((e) => e).join(" ")} ref={rootRef}>
      {componentName}
      <br />
      <br />
      <img src={pic} alt="pic" width={150} />

      <p>`staticProps` result:</p>
      {props.todo?.map((e, i) => (
        i < 10 && <div key={i}>{e.title}</div>
      ))}
    </div>
  );
}

export default React.forwardRef(AboutPage);
