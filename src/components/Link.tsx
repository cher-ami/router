import React, {
  AnchorHTMLAttributes,
  MutableRefObject,
  PropsWithChildren,
  useCallback,
  useMemo,
} from "react"
import { createUrl, TOpenRouteParams } from "../core/core"
import { joinPaths, removeLastCharFromString } from "../core/helpers"
import { useRouter } from "../hooks/useRouter"
import { useLocation } from "../hooks/useLocation"
import debug from "@cher-ami/debug"

// exclude href because it collides with "to"
type TAnchorWithoutHref = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">

export interface ILinkProps extends PropsWithChildren<TAnchorWithoutHref> {
  to: string | TOpenRouteParams
  onClick?: () => void
  className?: string
  children?: React.ReactNode
}

const log = debug("router:Link")

/**
 * @name Link
 */
function Link(props: ILinkProps, ref: MutableRefObject<any>) {
  const { history, staticLocation } = useRouter()
  const [location] = useLocation()

  // Compute URL
  const url = useMemo(() => createUrl(props.to), [props.to])

  // Link is active if its URL is the current URL
  const handleClick = useCallback(
    (event): void => {
      event.preventDefault()
      props.onClick?.()
      history?.push(url)
    },
    [url, history],
  )

  const [isActive, setIsActive] = React.useState<boolean>()
  React.useEffect(() => {
    const loc = history ? location : staticLocation
    setIsActive(loc === url || loc === removeLastCharFromString(url, "/", true))
  }, [history, staticLocation, location, url])

  return (
    <a
      {...{ ...props, to: undefined }}
      className={joinPaths(["Link", props.className, isActive && "active"], " ")}
      onClick={handleClick}
      children={props.children}
      href={url}
      ref={ref}
    />
  )
}

const ForwardLink = React.forwardRef(Link)
export { ForwardLink as Link }
