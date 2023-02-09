import { prerender } from "./prerender"
import { fetchAvailableUrls } from "./urls"
;(async () => {
  const urls = await fetchAvailableUrls()
  prerender(urls)
})()
