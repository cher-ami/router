import React, { forwardRef, MutableRefObject, useRef } from "react";
import { useLocation } from "../../src";
import { useStack } from "../../src";
import { transitionsHelper } from "../helper/transitionsHelper";

const componentName: string = "BarPage";
const debug = require("debug")(`front:${componentName}`);

interface IProps {}

export const BarPage = forwardRef((props: IProps, handleRef: MutableRefObject<any>) => {
  const rootRef = useRef(null);

  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn: () => transitionsHelper(rootRef.current, true),
    playOut: () => transitionsHelper(rootRef.current, false),
  });

  // test of redirection
  const [location, setLocation] = useLocation();

  return (
    <div className={componentName} ref={rootRef}>
      {componentName}
      <button onClick={() => setLocation("/")}>back to /</button>
    </div>
  );
});

BarPage.displayName = componentName;
export default BarPage;
