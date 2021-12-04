import React, {
  AnchorHTMLAttributes,
  PropsWithChildren,
  useCallback,
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
  const url = useMemo(() => {
    const createNewUrl = createUrl(props.to, routes, base);
    log("createNewUrl",createNewUrl)
    return createNewUrl;
  }, [props.to, routes, base]);

  const isActive = useMemo(
    () => location === url || location === removeLastCharFromString(url, "/", true),
    [location, url]
  );

  const handleClick = useCallback(
    (e) => {
      e.preventDefault();
      props.onClick?.();
      setLocation(url);
    },
    [url, props.onClick]
  );

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
