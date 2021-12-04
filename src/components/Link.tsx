import React, { AnchorHTMLAttributes, PropsWithChildren, useMemo } from "react";
import { useLocation, useRouter } from "..";
import {
  createUrl,
  joinPaths,
  removeLastCharFromString,
  TOpenRouteParams,
} from "../api/helpers";
import debug from "@wbe/debug";

// exclude href because it collides with "to"
type TAnchorWithoutHref = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export interface ILinkProps extends PropsWithChildren<TAnchorWithoutHref> {
  to: string | TOpenRouteParams;
  onClick?: () => void;
  className?: string;
}

const log = debug("router:Link");

/**
 * @name Link
 */
function Link(props: ILinkProps) {
  const { routes, base } = useRouter();
  const [location, setLocation] = useLocation();

  // Compute URL
  const url = useMemo(() => createUrl(props.to, routes, base), [props.to, routes, base]);

  // Link is active if its URL is the current URL
  const isActive = useMemo(
    () => location === url || location === removeLastCharFromString(url, "/", true),
    [location, url]
  );

  const handleClick = (event): void => {
    event.preventDefault();
    props.onClick?.();
    setLocation(props.to);
  };

  return (
    <a
      {...{ ...props, to: undefined }}
      className={joinPaths(["Link", props.className, isActive && "active"], " ")}
      onClick={handleClick}
      children={props.children}
      href={url}
    />
  );
}

export { Link };
