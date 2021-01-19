import React, { ReactNode } from "react";
import { useLocation } from "..";

interface IProps {
  to: string;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
}

const componentName = "Link";
const debug = require("debug")(`front:${componentName}`);

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

  return (
    <a
      className={[componentName, props.className, location === props.to && "active"]
        .filter((e: string) => e)
        .join(" ")}
      onClick={handleClick}
      href={props.to}
      children={props.children}
    />
  );
}

export { Link };
