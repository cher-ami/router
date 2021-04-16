"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRouteCounter = void 0;
var __1 = require("..");
var react_1 = require("react");
var routers_1 = require("../api/routers");
var componentName = "useLocation";
var debug = require("debug")("router:" + componentName);
/**
 * use Route Counter
 */
var useRouteCounter = function () {
    // get current route count
    var _a = react_1.useState(routers_1.ROUTERS.routeCounter), routeCounter = _a[0], setRouteCounter = _a[1];
    // check if is first route
    var _b = react_1.useState(routers_1.ROUTERS.isFirstRoute), isFirstRoute = _b[0], setIsFirstRoute = _b[1];
    // handle history
    __1.useHistory(function () {
        routers_1.ROUTERS.routeCounter = routeCounter + 1;
        setRouteCounter(routeCounter + 1);
        routers_1.ROUTERS.isFirstRoute = false;
        setIsFirstRoute(false);
    }, [routeCounter, isFirstRoute]);
    // allow to reset counter if needed (after first redirection for example)
    var resetCounter = function () {
        setRouteCounter(1);
        setIsFirstRoute(true);
    };
    return { routeCounter: routeCounter, isFirstRoute: isFirstRoute, resetCounter: resetCounter };
};
exports.useRouteCounter = useRouteCounter;
