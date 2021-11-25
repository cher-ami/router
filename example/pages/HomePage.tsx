import React, { ForwardedRef, forwardRef, useEffect, useRef } from "react";
import { ROUTERS, useHistory, useStack } from "../../src";
import { transitionsHelper } from "../helper/transitionsHelper";
import debug from "@wbe/debug";

const componentName: string = "HomePage";
const log = debug(`router:${componentName}`);

interface IProps {
  params: {
    lang: string;
  };
}

const HomePage = forwardRef((props: IProps, handleRef: ForwardedRef<any>) => {
  const rootRef = useRef(null);

  const history = useHistory();
  useEffect(() => {
    log("history form home", history);
  }, [history]);

  useEffect(() => {
    log("props.params.lang", props.params.lang);
  }, [props.params.lang]);

  useEffect(() => {
    setTimeout(() => {
      ROUTERS.history.push("/base/de/about/foo");
    }, 2000);
  }, []);

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

HomePage.displayName = componentName;
export default HomePage;
