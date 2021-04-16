"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouterInstance = exports.ERouterEvent = exports.EHistoryMode = void 0;
var path_parser_1 = require("path-parser");
var events_1 = require("events");
var helpers_1 = require("./helpers");
var routers_1 = require("./routers");
var history_1 = require("history");
var debug = require("debug")("router:RouterInstance");
var EHistoryMode;
(function (EHistoryMode) {
    EHistoryMode["BROWSER"] = "browser";
    EHistoryMode["HASH"] = "hash";
    EHistoryMode["MEMORY"] = "memory";
})(EHistoryMode = exports.EHistoryMode || (exports.EHistoryMode = {}));
var ERouterEvent;
(function (ERouterEvent) {
    ERouterEvent["PREVIOUS_ROUTE_CHANGE"] = "previous-route-change";
    ERouterEvent["CURRENT_ROUTE_CHANGE"] = "current-route-change";
    ERouterEvent["STACK_IS_ANIMATING"] = "stack-is-animating";
})(ERouterEvent = exports.ERouterEvent || (exports.ERouterEvent = {}));
/**
 * RouterInstance
 */
var RouterInstance = /** @class */ (function () {
    function RouterInstance(_a) {
        var _this = this;
        var _b = _a.base, base = _b === void 0 ? "/" : _b, _c = _a.routes, routes = _c === void 0 ? null : _c, middlewares = _a.middlewares, _d = _a.id, id = _d === void 0 ? 1 : _d, historyMode = _a.historyMode;
        // routes list
        this.routes = [];
        // create event emitter
        this.events = new events_1.EventEmitter();
        /**
         * Handle history
         * Call each time new event is fired by history
         */
        this.handleHistory = function (param) {
            _this.updateRoute(param);
        };
        this.base = base;
        this.id = id;
        this.middlewares = middlewares;
        this.historyMode = historyMode;
        if (!routes) {
            throw new Error("Router id " + id + " > no routes array is set.");
        }
        if (!routers_1.ROUTERS.history) {
            debug("No ROUTERS.history exist, create a new one", this.historyMode);
            routers_1.ROUTERS.history = this.getHistory(this.historyMode);
            // push first location history object in global locationsHistory
            routers_1.ROUTERS.locationsHistory.push(routers_1.ROUTERS.history.location);
        }
        // patch: create root path '/' if doesn't exist
        var rootPathExist = routes.some(function (route) { return route.path === "/"; });
        if (!rootPathExist) {
            routes.push({ path: "/", component: null });
        }
        // format routes
        routes.forEach(function (el) { return _this.addRoute(el); });
        // start
        this.updateRoute();
        this.initEvents();
    }
    /**
     * Initialise event
     */
    RouterInstance.prototype.initEvents = function () {
        var _this = this;
        this.unlistenHistory = routers_1.ROUTERS.history.listen(function (_a) {
            var location = _a.location, action = _a.action;
            debug(_this.id, " initEvents > history", { location: location, action: action });
            _this.handleHistory(location.pathname);
        });
    };
    /**
     * Destroy events
     */
    RouterInstance.prototype.destroyEvents = function () {
        // To stop listening, call the function returned from listen().
        this.unlistenHistory();
    };
    /**
     * Select History mode
     * doc: https://github.com/ReactTraining/history/blob/master/docs/getting-started.md
     * @param historyMode
     */
    RouterInstance.prototype.getHistory = function (historyMode) {
        if (historyMode === EHistoryMode.HASH) {
            return history_1.createHashHistory();
        }
        if (historyMode === EHistoryMode.MEMORY) {
            return history_1.createMemoryHistory();
        }
        if (historyMode === EHistoryMode.BROWSER) {
            return history_1.createBrowserHistory();
        }
        // in other case, return a browser history
        return history_1.createBrowserHistory();
    };
    /**
     * Add new route object to routes array
     */
    RouterInstance.prototype.addRoute = function (route) {
        this.routes.push(__assign(__assign({}, route), { parser: new path_parser_1.Path(route.path) }));
    };
    /**
     * Update route
     * - get route object matching with current URL
     * - emit selected route object on route-change event (listen by Stack)
     */
    RouterInstance.prototype.updateRoute = function (url) {
        var _a;
        if (url === void 0) { url = routers_1.ROUTERS.history.location.pathname; }
        // get matching route depending of current URL
        var matchingRoute = this.getRouteFromUrl({ pUrl: url });
        if (!matchingRoute) {
            debug(this.id, "updateRoute: NO MATCHING ROUTE. RETURN.");
            return;
        }
        if (((_a = this.currentRoute) === null || _a === void 0 ? void 0 : _a.matchUrl) === (matchingRoute === null || matchingRoute === void 0 ? void 0 : matchingRoute.matchUrl)) {
            debug(this.id, "updateRoute > THIS IS THE SAME URL, RETURN.");
            return;
        }
        this.previousRoute = this.currentRoute;
        this.currentRoute = matchingRoute;
        this.events.emit(ERouterEvent.PREVIOUS_ROUTE_CHANGE, this.previousRoute);
        this.events.emit(ERouterEvent.CURRENT_ROUTE_CHANGE, this.currentRoute);
    };
    /**
     * Get current route from URL using path-parser
     * @doc https://www.npmjs.com/package/path-parser
     */
    RouterInstance.prototype.getRouteFromUrl = function (_a) {
        var pUrl = _a.pUrl, _b = _a.pRoutes, pRoutes = _b === void 0 ? this.routes : _b, _c = _a.pBase, pBase = _c === void 0 ? this.base : _c, _d = _a.pCurrentRoute, pCurrentRoute = _d === void 0 ? null : _d, _e = _a.pPathParser, pPathParser = _e === void 0 ? null : _e, _f = _a.pMatch, pMatch = _f === void 0 ? null : _f;
        if (!pRoutes || (pRoutes === null || pRoutes === void 0 ? void 0 : pRoutes.length) === 0)
            return;
        var match;
        // test each routes
        for (var i in pRoutes) {
            var currentRoute = pRoutes[i];
            // TODO appeler tous les middlewares ici pour patcher les routes
            // ex: language service devrait pouvoir patcher les routes une a une
            // this.middlewares.foreach(middleware =>  middleware(currentRoute) ) ...
            // create parser & matcher
            var currentRoutePath = ("" + pBase + currentRoute.path).replace("//", "/");
            // prepare parser
            var pathParser = new path_parser_1.Path(currentRoutePath);
            // prettier-ignore
            debug(this.id, "getRouteFromUrl: currentUrl \"" + pUrl + "\" match with \"" + currentRoutePath + "\"?", !!pathParser.test(pUrl));
            // set new matcher
            match = pathParser.test(pUrl);
            // if current route path match with the param url
            if (match) {
                // prepare route obj
                var route = pCurrentRoute || currentRoute;
                var params = pMatch || match;
                var routeObj = {
                    fullUrl: pUrl,
                    matchUrl: helpers_1.buildUrl(route.path, params),
                    path: route === null || route === void 0 ? void 0 : route.path,
                    component: route === null || route === void 0 ? void 0 : route.component,
                    children: route === null || route === void 0 ? void 0 : route.children,
                    parser: pPathParser || pathParser,
                    props: __assign({ params: params }, ((route === null || route === void 0 ? void 0 : route.props) || {})),
                };
                debug(this.id, "getRouteFromUrl: > MATCH routeObj", routeObj);
                return routeObj;
            }
            // if not match
            else if (currentRoute === null || currentRoute === void 0 ? void 0 : currentRoute.children) {
                // else, call recursively this same method with new params
                var matchingChildren = this.getRouteFromUrl({
                    pUrl: pUrl,
                    pRoutes: currentRoute === null || currentRoute === void 0 ? void 0 : currentRoute.children,
                    pBase: currentRoutePath,
                    pCurrentRoute: currentRoute,
                    pPathParser: pathParser,
                    pMatch: match,
                });
                debug(this.id, "matchingChildren", matchingChildren);
                // only if matching, return this match, else continue to next iteration
                if (matchingChildren)
                    return matchingChildren;
            }
        }
    };
    return RouterInstance;
}());
exports.RouterInstance = RouterInstance;
