import React, { ReactNode, useMemo } from "react";
import { useLocation } from "..";
import { formatUrl } from "../api/helpers";

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

  const handleClick = (e) => {
    e.preventDefault();
    props.onClick?.();
    setLocation(props.to);
  };

  const isActive = useMemo(() => {
    return location === formatUrl(props.to);
  }, [location, props.to]);

  return (
    <a
      className={[componentName, props.className, isActive && "active"]
        .filter((e: string) => e)
        .join(" ")}
      onClick={handleClick}
      href={props.to}
      children={props.children}
    />
  );
}

export { Link };
