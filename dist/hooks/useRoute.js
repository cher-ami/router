"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRoute = void 0;
var __1 = require("..");
var useRouter_1 = require("./useRouter");
var react_1 = require("react");
var componentName = "useRoutes";
var debug = require("debug")("router:" + componentName);
/**
 * useRoutes
 */
var useRoute = function (currentRouteChangeCallback, dep) {
    if (dep === void 0) { dep = []; }
    var router = useRouter_1.useRouter();
    var _a = react_1.useState(router.previousRoute), previousRoute = _a[0], setPreviousRoute = _a[1];
    var _b = react_1.useState(router.currentRoute), currentRoute = _b[0], setCurrentRoute = _b[1];
    var handleCurrentRouteChange = function (route) {
        currentRouteChangeCallback === null || currentRouteChangeCallback === void 0 ? void 0 : currentRouteChangeCallback();
        setCurrentRoute(route);
    };
    var handlePreviousRouteChange = function (route) {
        setPreviousRoute(route);
    };
    react_1.useLayoutEffect(function () {
        router.events.on(__1.ERouterEvent.CURRENT_ROUTE_CHANGE, handleCurrentRouteChange);
        router.events.on(__1.ERouterEvent.PREVIOUS_ROUTE_CHANGE, handlePreviousRouteChange);
        return function () {
            router.events.off(__1.ERouterEvent.CURRENT_ROUTE_CHANGE, handleCurrentRouteChange);
            router.events.off(__1.ERouterEvent.PREVIOUS_ROUTE_CHANGE, handlePreviousRouteChange);
        };
    }, dep);
    return {
        previousRoute: previousRoute,
        currentRoute: currentRoute,
        setPreviousRoute: setPreviousRoute,
        setCurrentRoute: setCurrentRoute,
    };
};
exports.useRoute = useRoute;
