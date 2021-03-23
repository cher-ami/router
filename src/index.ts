export { RouterInstance, TRoute, ERouterEvent, EHistoryMode } from "./api/RouterInstance";

export { Router } from "./components/Router";
export { Link } from "./components/Link";
export { Stack, TManageTransitions } from "./components/Stack";

export { useRootRouter, useRouter } from "./hooks/useRouter";
export { useLocation, prepareSetLocationUrl } from "./hooks/useLocation";
export { useRoute } from "./hooks/useRoute";
export { useHistory } from "./hooks/useHistory";
export { useRouteCounter } from "./hooks/useRouteCounter";
export { useStack, IRouteStack } from "./hooks/useStack";
export { useLang } from "./hooks/useLang";

export { langMiddleware } from "./lang/LangMiddleware";
export { TLanguage } from "./lang/LangService";

// export as singleton
export const LangService = require("./lang/LangService").default;
