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

  const [location, setLocation] = useLocation();

  return (
    <div className={componentName} ref={rootRef}>
      {componentName}

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

BarPage.displayName = componentName;
export default BarPage;
