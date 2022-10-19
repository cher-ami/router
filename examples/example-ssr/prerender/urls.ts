/**
 *  Return available Urls of our application
 *
 *
 *
 */
export const fetchAvailableUrls = async () => {
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


  return [
    // "/",
    // "/about",
    // "/about/foo",
    // "/about/bar",
    // "/article/article-1",
    // "/article/article-2",
    // "/contact",

    "/fr",
    "/fr/about",
    "/fr/about/foo",
    "/fr/about/bar",
    "/fr/article/article-1",
    "/fr/article/article-2",
    "/fr/contact",

    "/en",
    "/en/about",
    "/en/about/foo",
    "/en/about/bar",
    "/en/article/article-1",
    "/en/article/article-2",
    "/en/contact",
    "/404"
  ]
};
