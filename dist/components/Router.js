"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = exports.RouterContext = exports.ERouterEnvironment = void 0;
var __1 = require("..");
var react_1 = __importStar(require("react"));
var helpers_1 = require("../api/helpers");
var routers_1 = require("../api/routers");
var history_1 = require("history");
var componentName = "Router";
var debug = require("debug")("front:" + componentName);
var ERouterEnvironment;
(function (ERouterEnvironment) {
    ERouterEnvironment["BROWSER"] = "browser";
    ERouterEnvironment["HASH"] = "hash";
    ERouterEnvironment["MEMORY"] = "memory";
})(ERouterEnvironment = exports.ERouterEnvironment || (exports.ERouterEnvironment = {}));
// Router instance will be keep on this context
// Big thing is you can access this context from the closest provider in the tree.
// This allow to manage easily nested stack instances.
exports.RouterContext = react_1.createContext(null);
exports.RouterContext.displayName = componentName;
/**
 * Router
 * This component returns children wrapped by provider who contains router instance
 */
exports.Router = react_1.memo(function (props) {
    // get parent router instance if exist, in case we are one sub router
    var parentRouter = __1.useRouter();
    // we need to join each parent router base
    var base = react_1.useMemo(function () { return helpers_1.joinPaths([parentRouter === null || parentRouter === void 0 ? void 0 : parentRouter.base, props.base]); }, [props.base]);
    // Select router environment once
    // doc: https://github.com/ReactTraining/history/blob/master/docs/getting-started.md
    if (!routers_1.ROUTERS.history) {
        switch (props.environment) {
            case ERouterEnvironment.HASH:
                routers_1.ROUTERS.history = history_1.createHashHistory();
                break;
            case ERouterEnvironment.MEMORY:
                routers_1.ROUTERS.history = history_1.createMemoryHistory();
                break;
            default:
                routers_1.ROUTERS.history = history_1.createBrowserHistory();
                break;
        }
        routers_1.ROUTERS.locationsHistory.push(routers_1.ROUTERS.history);
    }
    // get routes list by props first
    // if there is no props.routes, we deduce that we are on a subrouter
    var routes = react_1.useMemo(function () {
        var _a;
        var currentRoutesList;
        if (props.routes) {
            routers_1.ROUTERS.routes = props.routes;
            currentRoutesList = props.routes;
        }
        else {
            currentRoutesList = (_a = routers_1.ROUTERS === null || routers_1.ROUTERS === void 0 ? void 0 : routers_1.ROUTERS.routes) === null || _a === void 0 ? void 0 : _a.find(function (el) { return el.path === props.base; }).children;
        }
        return currentRoutesList;
    }, [props.routes, props.base]);
    // deduce a router ID
    var id = react_1.useMemo(function () { var _a; return (((_a = routers_1.ROUTERS.instances) === null || _a === void 0 ? void 0 : _a.length) > 0 ? routers_1.ROUTERS.instances.length + 1 : 1); }, []);
    // keep router instance in state
    var routerState = react_1.useState(function () {
        var newRouter = new __1.RouterInstance({
            base: base,
            routes: routes,
            id: id,
            middlewares: props.middlewares,
        });
        // keep new router in global constant
        routers_1.ROUTERS.instances.push(newRouter);
        // return it as state
        debug("ROUTERS", routers_1.ROUTERS);
        return newRouter;
    })[0];
    react_1.useEffect(function () {
        debug(componentName + " > routers array", routers_1.ROUTERS.instances);
        return function () {
            // on destroy, we need to remove this current router instance from ROUTERS.instances array
            // remove 1 element from specific index
            routers_1.ROUTERS.instances.splice(routers_1.ROUTERS.instances.findIndex(function (el) { return el.id === routerState.id; }), 1);
            debug(componentName + " > routers array after splice", routers_1.ROUTERS.instances);
            routerState.destroyEvents();
        };
    }, [routerState]);
    return react_1.default.createElement(exports.RouterContext.Provider, { value: routerState, children: props.children });
});
exports.Router.displayName = componentName;
