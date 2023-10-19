import fetch from "cross-fetch"

export const fetchAvailableUrls = async (): Promise<string[]> => {
  /**
   If urls come from API, fetch and return URLS instead

   let data
   try {
    data = await fetch("urls.json").then((res) => res.json())
   } catch (e) {
      console.log(e)
   }
   return data
   */

  // return static urls
  // prettier-ignore
  return new Promise(resolve => {
    resolve([
      "/",
      "/a-propos",
      "/a-propos/foo",
      "/a-propos/bar",
      "/article/article-1",
      "/article/article-2",
      "/contact",

      // "/fr",
      // "/fr/a-propos",
      // "/fr/a-propos/foo",
      // "/fr/a-propos/bar",
      // "/fr/article/article-1",
      // "/fr/article/article-2",
      // "/fr/contact",

      "/en",
      "/en/about",
      "/en/about/foo",
      "/en/about/bar",
      "/en/article/article-1",
      "/en/article/article-2",
      "/en/contact",

      "/404"
    ])
  })
}
