import { BrowserHistory, HashHistory, MemoryHistory, Update } from "history"
import React from "react"
import { useRouter } from "./useRouter"
import debug from "@wbe/debug"

const log = debug("router:useHistory")

/**
 * Handle router history
 */
export function useHistory(
  callback?: (e: Update) => void,
  deps: any[] = [],
): BrowserHistory | HashHistory | MemoryHistory {
  const { history } = useRouter()

  React.useEffect(() => {
    return history?.listen((e) => {
      callback?.(e)
    })
  }, [history, ...deps])

  return history
}
