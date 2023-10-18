export type TAssetsList = string[]
export type TAssetsByType = { [x: string]: string[] }

export type TScript = { tag: string; attr: { [x: string]: string } }
export type TScriptsObj = {
  [ext: string]: TScript[]
}

/**
 * ManifestParser
 * Allow to get scriptTags
 *
 *
 *
 */
export class ManifestParser {
  /**
   * Directly get script Tags from raw manifest string
   * @param manifestRaw
   * @param base
   */
  static getScriptTagFromManifest(manifestRaw: string, base = "/"): TScriptsObj {
    const assets = ManifestParser.getAssets(manifestRaw)
    const assetsByType = ManifestParser.sortAssetsByType(assets)
    return ManifestParser.getScripts(assetsByType, base)
  }

  /**
   * Get script tags
   *
   *  ex:
   *  {
   *   js: [
   *     {
   *        tag: 'script',
   *        attr: {
   *          src: ""
   *          noModule: "",
   *       }
   *     },
   * }
   * ...
   *
   * @param assetListByType
   * @param base
   */
  static getScripts(assetListByType: TAssetsByType, base = "/"): TScriptsObj {
    if (typeof assetListByType !== "object" || !assetListByType) {
      console.error("assetListByType is not valid, return", assetListByType)
      return
    }
    // prettier-ignore
    return Object.keys(assetListByType).reduce((a, b: string) =>
    {
      const scriptURLs = assetListByType[b]
      let scripts: TScript[]
      if (b === "js") {
        scripts = scriptURLs.map(url => {
          return {
            tag: "script",
            attr: {
              ...(url.includes("legacy")  ? {noModule: ""} : {type: "module"}),
              crossOrigin:"anonymous",
              src: `${base}${url}`
            }
          }
        })
      }
      else if (b === "css") {
        scripts = scriptURLs.map(url => ({
            tag: "link",
            attr: {
              rel: "stylesheet",
              href: `${base}${url}`
            }
        }))
      }
      else if (b === "woff2") {
        scripts = scriptURLs.map(url => ({
          tag: "link",
          attr: {
            rel: "preload",
            as: "font",
            type:"font/woff2",
            crossOrigin:"anonymous",
            href: `${base}${url}`
          }
        }))
      }
      return { ...a, ...(scripts ? {[b]: scripts} : {}) }
    },{})
  }

  /**
   *
   * Get assets by type (by extension):
   * ex:
   *    {
   *     js: [
   *       'index-legacy-e92b0b23.js',
   *       'polyfills-legacy-163e9122.js',
   *       'index-475b5da0.js'
   *     ],
   *     woff2: [
   *       'roboto-regular-8cef0863.woff2',
   *       'roboto-regular-8cef0863.woff2'
   *     ],
   *     css: [
   *       'index-ef71c845.css'
   *     ],
   *     ...
   *   }
   *
   * Group by extensions
   * @param assetList
   */
  static sortAssetsByType(assetList: TAssetsList): TAssetsByType {
    return assetList.reduce((a, b) => {
      const ext = b.split(".")[b.split(".").length - 1]
      if (a?.[ext] && !a[ext].includes(b)) {
        a[ext].push(b)
        return a
      } else {
        return {
          ...a,
          [ext]: [b],
        }
      }
    }, {})
  }

  /**
   * Get assets list
   *
   * [
   *   'index-legacy-e92b0b23.js',
   *   'roboto-regular-8cef0863.woff2',
   *   'roboto-regular-18ab5ae4.woff',
   *   'roboto-regular-b122d9b1.ttf',
   *   'polyfills-legacy-163e9122.js',
   *   'index-475b5da0.js',
   * ]
   *
   *
   * Return all assets
   * @param manifestRawFile
   */
  static getAssets(manifestRawFile: string): TAssetsList {
    if (!manifestRawFile) return
    const jsonManifest = JSON.parse(manifestRawFile)

    const list = Object.keys(jsonManifest)
      .reduce(
        (a, b) =>
          jsonManifest[b].isEntry
            ? [
                ...a,
                jsonManifest[b].file,
                ...(jsonManifest[b]?.assets || []),
                ...(jsonManifest[b]?.css || []),
              ]
            : a,
        []
      )
      .filter((e) => e)

    return [...new Set(list)]
  }
}
