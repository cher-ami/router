import { TScript } from "../../../prerender/helpers/ManifestParser"
import * as React from "react"

export const ScriptTag = ({ tag, attr }: TScript): JSX.Element => {
  const T = tag
  // @ts-ignore
  if (attr.noModule === "") return <T {...attr} noModule />
  else return <T {...attr} />
}

export const CherScripts = ({ scripts }: { scripts: TScript[] }): JSX.Element => (
  <>
    {scripts?.map((script, i) => (
      <ScriptTag key={i} {...script} />
    ))}
  </>
)
