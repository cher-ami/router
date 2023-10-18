/**
 * Detect If current URL is a route index
 * If true, we want to generate /foo/index.html instead of "/foo.html"
 *
 * @param url Url to test
 * @param urls List of available URLs
 * @param log
 */
export const isRouteIndex = (url, urls, log = false): boolean => {
  if (!urls.includes(url)) {
    // console.warn(`isRouteIndex > ${url} isn't in the list, return false.`)
    return false
  }

  log && console.log("url", url)
  // if URL is "/" we want to generate /index.html
  if (url === "/") return true

  // If /url/ we want to generate /url/index.html
  if (url.endsWith("/")) return true

  // get every URL of the list witch starting with same base
  const group = urls.filter((e) => e.startsWith(url))
  log && console.log("group", group)

  // check if on of others in group is subRoute and not only same level route
  // witch starting with the same string
  // ex: ["/foo", "/foo-bar"] are on the same level,
  // ex: ["/foo", "/foo/bar"] are two different level route
  const subRouteExist = group.some((e) => e.slice(url.length).includes("/"))
  log && console.log("subRouteExist", subRouteExist)

  // if group is [ '/thanks/form', '/thanks' ]
  // we want the base route: "/thanks"
  const baseRoute = group?.sort((a, b) => a.length - b.length)?.[0]
  log && console.log("baseRoute", baseRoute)

  return (
    // if group as more than 1 URL, this is a sub router case (or root case "/")
    // & if baseRoute equal to param URL, param URL should be the index page
    group.length > 1 && baseRoute === url && subRouteExist
  )
}
