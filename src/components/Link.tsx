import React, { ReactNode, useMemo } from "react";
import { prepareSetLocationUrl, useLocation } from "..";
import { joinPaths, TOpenRouteParams } from "../api/helpers";

interface IProps {
  to: string | TOpenRouteParams;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
}

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
      className={joinPaths(["Link", props.className, isActive && "active"], " ")}
      onClick={handleClick}
      children={props.children}
      href={url}
    />
  );
}

export { Link };
