import React, { ForwardedRef, forwardRef, useRef } from "react";
import { useStack } from "../../src";
import { transitionsHelper } from "../helper/transitionsHelper";
const componentName: string = "ArticlePage";
const debug = require("debug")(`router:${componentName}`);

interface IProps {
  params: { id: string };
}

const ArticlePage = forwardRef((props: IProps, handleRef: ForwardedRef<any>) => {
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
      {componentName} {props.params.id}
    </div>
  );
});

ArticlePage.displayName = componentName;
export default ArticlePage;
