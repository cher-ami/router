import React, { ForwardedRef, forwardRef, useRef } from "react";
import { useLocation } from "@cher-ami/router";
import { useStack }  from "@cher-ami/router";
import { transitionsHelper } from "../helper/transitionsHelper";
import debug from "@wbe/debug";

interface IProps {
  params?: {
    id: string;
  };
}

const componentName = "ArticlePage";
const log = debug(`router:${componentName}`);

/**
 * @name ArticlePage
 */
export const ArticlePage = forwardRef((props: IProps, handleRef: ForwardedRef<any>) => {
  const rootRef = useRef(null);
  const [location, setLocation] = useLocation();

  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn: () => transitionsHelper(rootRef.current, true, { x: -50 }, { x: 0 }),
    playOut: () => transitionsHelper(rootRef.current, false, { x: -0 }, { x: 50 }),
  });

  return (
    <div className={componentName} ref={rootRef}>
      {componentName} - id: {props?.params?.id}
      <br />
      <br />
      <button
        onClick={() => {
          setLocation("/");
        }}
      >
        navigate to /
      </button>
      <code>{`  setLocation("/")`}</code>
      <br />
      <button
        onClick={() => {
          setLocation({ name: "ArticlePage", params: { id: "hello" } });
        }}
      >
        {`navigate to ArticlePage`}
      </button>
      <code>{`  setLocation({ name: "ArticlePage", params: { id: "hello" } })`}</code>
      <br />
    </div>
  );
});

ArticlePage.displayName = componentName;
export default ArticlePage;
