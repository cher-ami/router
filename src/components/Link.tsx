import React, { ReactNode, useMemo } from "react";
import { useLocation } from "..";
import { joinPaths, TOpenRouteParams } from "../api/helpers";

interface IProps {
  to: string;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
}

/**
 * @name Link
 */
function Link(props: IProps) {
  const [location, setLocation] = useLocation();
  //  const url = useMemo(() => prepareSetLocationUrl(props.to), [props.to]);

  const handleClick = (e) => {
    e.preventDefault();
    props.onClick?.();
    setLocation(props.to);
  };

  return (
    <a
      className={joinPaths(["Link", props.className], " ")}
      onClick={handleClick}
      children={props.children}
      href={props.to}
    />
  );
}

export { Link };
