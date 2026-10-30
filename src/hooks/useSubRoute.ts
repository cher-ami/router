import { useRouter } from "./useRouter"

/**
 * Returns current route of the sub-router rendered inside this page
 * shortcut: with several sub-routers in the same page, the last one to change wins, add an id param if needed
 */
export const useSubRoute = () => useRouter().subRoute
