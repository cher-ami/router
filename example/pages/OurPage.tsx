import React, { ForwardedRef, forwardRef, useRef } from "react";
import { useStack } from "../../src";
import { transitionsHelper } from "../helper/transitionsHelper";
const componentName: string = "OurPage";

interface IProps {}

const OurPage = forwardRef((props: IProps, handleRef: ForwardedRef<any>) => {
  const rootRef = useRef(null);

  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn: () => transitionsHelper(rootRef.current, true),
    playOut: () => transitionsHelper(rootRef.current, false),
  });

  return (
    <div className={componentName} ref={rootRef}>
      {componentName}
    </div>
  );
});

OurPage.displayName = componentName;
export default OurPage;
