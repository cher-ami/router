import React, { ForwardedRef, forwardRef, useRef } from "react";
import { Link, openRoute, useStack } from "../../src";
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
      <Link to={{ name: "ArticlePage" ,params: {id: "coucou"} }}>Article</Link>
      <br />
      <Link to={{ name: "AboutPage" }}>About</Link>
    </div>
  );
});

FooPage.displayName = componentName;
export default FooPage;
