import React, { AnchorHTMLAttributes, PropsWithChildren, useMemo } from "react";
import {
  createUrl,
  joinPaths,
  removeLastCharFromString,
  TOpenRouteParams,
} from "../core/helpers";
import { useRouter } from "../hooks/useRouter";
import { useLocation } from "../hooks/useLocation";
import debug from "@wbe/debug";

// exclude href because it collides with "to"
type TAnchorWithoutHref = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export interface ILinkProps extends PropsWithChildren<TAnchorWithoutHref> {
  to: string | TOpenRouteParams;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const log = debug("router:Link");

/**
 * @name Link
 */
function Link(props: ILinkProps) {
  const { history, staticLocation } = useRouter();
  const [location] = useLocation();

  // Compute URL
  const url = useMemo(() => createUrl(props.to), [props.to]);

  // Link is active if its URL is the current URL

  const handleClick = (event): void => {
    event.preventDefault();
    props.onClick?.();
    history?.push(url);
  };

  // FIXME re add active link
  // const isActive = useMemo(() => {
  //   const l = history ? location : staticLocation;
  //   return l === url || l === removeLastCharFromString(url, "/", true);
  // }, [history, staticLocation, location, url]);

  return (
    <a
      {...{ ...props, to: undefined }}
      className={joinPaths(["Link", props.className], " ")}
      onClick={handleClick}
      children={props.children}
      href={url}
    />
  );
}

export { Link };
