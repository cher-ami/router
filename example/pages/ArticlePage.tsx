import React, { forwardRef, MutableRefObject, useRef } from "react";
import { useLocation } from "../../src";
import { useStack } from "../../src";
import { transitionsHelper } from "../helper/transitionsHelper";

interface IProps {
  params?: {
    id: string;
  };
}

const componentName = "ArticlePage";
const debug = require("debug")(`front:${componentName}`);

/**
 * @name ArticlePage
 */
export const ArticlePage = forwardRef(
  (props: IProps, handleRef: MutableRefObject<any>) => {
    debug("params", props);
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
        {componentName} - id: {props?.params?.id}
        <br />
        <button
          onClick={() => {
            setLocation("/");
          }}
        >
          navigate to /
        </button>
        <button
          onClick={() => {
            setLocation({ name: "ArticlePage", params: { id: "hello" } });
          }}
        >
          navigate to ArticlePage with param "hello"
        </button>
        <button
          onClick={() => {
            setLocation({ name: "BarPage" });
          }}
        >
          navigate BarPage
        </button>
      </div>
    );
  }
);

ArticlePage.displayName = componentName;
export default ArticlePage;
