export { ROUTERS } from "./api/routers";
export { CreateRouter } from "./api/CreateRouter";
export type { TRoute } from "./api/CreateRouter";
export { Router } from "./components/Router";
export { Link } from "./components/Link";

export { Stack } from "./components/Stack";
export type { TManageTransitions } from "./components/Stack";

export { useRouter } from "./hooks/useRouter";
export { useLocation } from "./hooks/useLocation";
export { useHistory } from "./hooks/useHistory";
export { useRouteCounter } from "./hooks/useRouteCounter";
export { useStack } from "./hooks/useStack";
export type { IRouteStack } from "./hooks/useStack";

export { langMiddleware } from "./lang/LangMiddleware";
export { default as LangService } from "./lang/LangService";
export type { TLanguage } from "./lang/LangService";
