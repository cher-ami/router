import React, { ReactNode, useMemo } from "react";
import { prepareSetLocationUrl, useLocation } from "..";
import { joinPaths } from "../api/helpers";

interface IProps {
  to: string;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
}

const componentName = "Link";
const debug = require("debug")(`router:${componentName}`);

/**
 * @name Link
 */
function Link(props: IProps) {
  const [location, setLocation] = useLocation();

  const url = useMemo(() => prepareSetLocationUrl(props.to), [props.to]);

  const isActive = useMemo(() => location === url, [location, url]);

  const handleClick = (e) => {
    e.preventDefault();
    props.onClick?.();
    setLocation(props.to);
  };

  return (
    <a
      className={joinPaths([componentName, props.className, isActive && "active"], " ")}
      onClick={handleClick}
      children={props.children}
      href={url}
    />
  );
}

export { Link };
