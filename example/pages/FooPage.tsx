import React, { ForwardedRef, forwardRef, useRef } from "react";
import { openRoute, useStack } from "../../src";
import { transitionsHelper } from "../helper/transitionsHelper";
const componentName: string = "FooPage";

interface IProps {}

const FooPage = forwardRef((props: IProps, handleRef: ForwardedRef<any>) => {
  const rootRef = useRef(null);

  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn: () =>
      transitionsHelper(rootRef.current, true, { y: -50, autoAlpha: 1 }, { y: 0 }),
    playOut: () => transitionsHelper(rootRef.current, false, { y: -0 }, { y: 50, autoAlpha:0}),
  });

  return (
    <div className={componentName} ref={rootRef}>
      {componentName}
      <br />
      <button
        children={`navigate to FooPage`}
        onClick={() => openRoute({ name: "OurPage" })}
      />
    </div>
  );
});

FooPage.displayName = componentName;
export default FooPage;
