import React, { ForwardedRef, forwardRef, useRef } from "react";
import { Link, useLocation, useStack } from "../../src";
import { transitionsHelper } from "../helper/transitionsHelper";
const componentName: string = "OurPage";

interface IProps {}

const OurPage = forwardRef((props: IProps, handleRef: ForwardedRef<any>) => {
  const rootRef = useRef(null);

  const [location, setLocation] = useLocation();

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
      <br />
      {/* <button
        children={`navigate to FooPage`}
        onClick={() => setLocation({ name: "FooPage" })}
      /> */}

      <Link to={{ name: "FooPage" }} children={`navigate to FooPage`} />
    </div>
  );
});

OurPage.displayName = componentName;
export default OurPage;
