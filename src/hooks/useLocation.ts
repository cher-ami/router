import { useState } from "react"
import { useHistory } from "../hooks/useHistory"
import { createUrl, TOpenRouteParams } from "../core/core"
import debug from "@cher-ami/debug"
import { useRouter } from "./useRouter"
const log = debug("router:useLocation")

/**
 * useLocation
 */
export const useLocation = (): [string, (param: string | TOpenRouteParams) => void] => {
  const { staticLocation } = useRouter()

  const history = useHistory((event) => {
    setPathname(event.location.pathname + event.location.search + event.location.hash)
  }, [])

  // Get dynamic current location
  const [pathname, setPathname] = useState(
    staticLocation ||
      history?.location.pathname + history?.location.search + history?.location.hash,
  )

  // Prepare setLocation function, who push in history
  function setLocation(args: string & TOpenRouteParams): void {
    history?.push(createUrl(args))
  }

  return [pathname, setLocation]
}
