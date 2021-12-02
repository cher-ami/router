import React, {
  AnchorHTMLAttributes,
  PropsWithChildren,
  useEffect,
  useMemo,
} from "react";
import { useLocation, useRouter } from "..";
import {
  createUrl,
  joinPaths,
  removeLastCharFromString,
  TOpenRouteParams,
} from "../api/helpers";

// exclude href because it collides with "to"
type TAnchorWithoutHref = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export interface ILinkProps extends PropsWithChildren<TAnchorWithoutHref> {
  to: string | TOpenRouteParams;
  onClick?: () => void;
  className?: string;
}

/**
 * @name Link
 */
function Link(props: ILinkProps) {
  const { routes, base } = useRouter();
  const [location, setLocation] = useLocation();

  const url = useMemo(() => createUrl(props.to, routes, base), [props.to, routes, base]);
  useEffect(() => {
    console.log("url", url, base);
  }, [url]);

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
      {...{ ...props, to: undefined }}
      className={joinPaths(["Link", props.className, isActive && "active"], " ")}
      onClick={handleClick}
      children={props.children}
      href={url}
    />
  );
}

export { Link };
