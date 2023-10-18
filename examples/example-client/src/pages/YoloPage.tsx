import React, { ForwardedRef, forwardRef, useRef } from "react";
import { useLocation, useStack } from "@cher-ami/router";
import { transitionsHelper } from "../helper/transitionsHelper";
const componentName: string = "YoloPage";

interface IProps {
  time: {
    datetime: string;
  };
}

const YoloPage = forwardRef((props: IProps, handleRef: ForwardedRef<any>) => {
  const rootRef = useRef(null);

  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn: () => transitionsHelper(rootRef.current, true),
    playOut: () => transitionsHelper(rootRef.current, false),
  });

  const [location, setLocation] = useLocation();

  return (
    <div className={componentName} ref={rootRef}>
      {componentName}
      <div>fetch props datetime: {props.time?.datetime}</div>

      <br />
      <br />
      <button
        onClick={() => {
          setLocation({ name: "ArticlePage", params: { id: "form-sub-router" } });
        }}
      >
        {`navigate to ArticlePage (1st level)`}
      </button>
      <code>{`  setLocation({ name: "ArticlePage", params: { id: "form-sub-router" } })`}</code>
    </div>
  );
});

YoloPage.displayName = componentName;
export default YoloPage;
