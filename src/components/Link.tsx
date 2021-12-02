import React, { AnchorHTMLAttributes, PropsWithChildren, useMemo } from "react";
import { useLocation } from "..";
import {
  createUrl,
  joinPaths,
  removeLastCharFromString,
  TOpenRouteParams,
} from "../api/helpers";

// exclude href because it collides with "to"
type AnchorWithoutHref = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">

export interface ILinkProps extends PropsWithChildren<AnchorWithoutHref> {
  to: string | TOpenRouteParams;
  onClick?: () => void;
  className?: string;
}

/**
 * @name Link
 */
function Link(props: ILinkProps) {
  const [location, setLocation] = useLocation();

  const url = useMemo(() => createUrl(props.to), [props.to]);

  const isActive = useMemo(
    () => location === url || location === removeLastCharFromString(url, "/", true),
    [location, url]
  );

  const handleClick = (e) => {
    e.preventDefault();
    props.onClick?.();
    setLocation(props.to);
  };

  return (
    <a
      {...props}
      className={joinPaths(["Link", props.className, isActive && "active"], " ")}
      onClick={handleClick}
      children={props.children}
      href={url}
    />
  );
}

export { Link };
