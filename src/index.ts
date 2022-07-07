export { Routers } from "./core/Routers";
export { Router } from "./components/Router";
export type { TRoute } from "./components/Router";
export { Link } from "./components/Link";
export {
  createUrl,
  openRoute,
  getSubRouterBase,
  getSubRouterRoutes,
  getPathByRouteName,
  requestStaticPropsFromRoute,
} from "./core/helpers";
export { getCurrentRoute } from "./core/matcher";
export type { TOpenRouteParams } from "./core/helpers";

export { Stack } from "./components/Stack";
export type { TManageTransitions } from "./components/Stack";

export { useRouter } from "./hooks/useRouter";
export { useLocation } from "./hooks/useLocation";
export { useHistory } from "./hooks/useHistory";
export { useRouteCounter } from "./hooks/useRouteCounter";
export { useStack } from "./hooks/useStack";
export { useLang } from "./hooks/useLang";
export type { IRouteStack } from "./hooks/useStack";

export { default as LangService } from "./core/LangService";
export type { TLanguage } from "./core/LangService";
