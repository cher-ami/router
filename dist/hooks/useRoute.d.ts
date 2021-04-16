import { TRoute } from "..";
/**
 * useRoutes
 */
export declare const useRoute: (currentRouteChangeCallback?: () => void, dep?: any[]) => {
    previousRoute: TRoute;
    currentRoute: TRoute;
    setPreviousRoute: import("react").Dispatch<import("react").SetStateAction<TRoute>>;
    setCurrentRoute: import("react").Dispatch<import("react").SetStateAction<TRoute>>;
};
