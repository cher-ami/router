import React, { useEffect, useRef } from "react";
import { useRouter, useStack } from "@cher-ami/router";
import { transitionsHelper } from "../helpers/transitionsHelper";
import { useLang } from "@cher-ami/router";

const componentName = "FooPage";
function FooPage(props, handleRef) {
  const rootRef = useRef(null);
  const [lang] = useLang();

  const router = useRouter();
    console.log("router", router);
  useEffect(() => {
  }, []);

  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn: () => transitionsHelper(rootRef.current, true, { x: -50 }, { x: 0 }),
    playOut: () => transitionsHelper(rootRef.current, false, { x: -0 }, { x: 50 }),
  });

  return (
    <div className={[componentName].filter((e) => e).join(" ")} ref={rootRef}>
      {componentName} - langKey: {router.langService && router.langService.currentLang.key}
    </div>
  );
}

export default React.forwardRef(FooPage);
