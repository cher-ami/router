import * as React from "react"

/**
 * Insert raw script in window variable
 * @param name
 * @param obj
 */
export const RawScript = ({ name, data }) => {
  const stringify = (e): string => JSON.stringify(e, null, 2)?.replace(/\n\s+/g, "")
  return (
    <script
      type="text/javascript"
      dangerouslySetInnerHTML={{
        __html: `window.${name}=${stringify(data)}`,
      }}
    />
  )
}
