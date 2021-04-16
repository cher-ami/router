"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUrlByRouteName = exports.getUrlByPath = exports.buildUrl = exports.joinPaths = void 0;
var path_parser_1 = require("path-parser");
var debug = require("debug")("router:helpers");
function joinPaths(paths) {
    return paths === null || paths === void 0 ? void 0 : paths.filter(function (e) { return e; }).join("").replace("//", "/");
}
exports.joinPaths = joinPaths;
/**
 * Build an URL with path and params
 */
function buildUrl(path, params) {
    var newPath = new path_parser_1.Path(path);
    return newPath.build(params);
}
exports.buildUrl = buildUrl;
/**
 * Get URL by path
 *  if path "/foo" is a children of path "/bar", his full url is "/bar/foo"
 *  With "/foo" this function will return "/bar/foo"
 * @returns string
 */
function getUrlByPath(routes, path, basePath) {
    var _a;
    if (basePath === void 0) { basePath = null; }
    // prepare local path
    var localPath = [basePath];
    for (var i in routes) {
        var route = routes[i];
        // if path match on first level
        if (route.path === path) {
            // keep path in local array
            localPath.push(route.path);
            // return it
            return joinPaths(localPath);
        }
        // if not matching but as children, return it
        else if (((_a = route === null || route === void 0 ? void 0 : route.children) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            // no match, recall recursively on children
            var matchChildrenPath = getUrlByPath(route.children, path, joinPaths(localPath));
            debug("getUrlByPath > match children path", matchChildrenPath);
            // return recursive Fn only if match, else continue to next iteration
            if (matchChildrenPath) {
                // keep path in local array
                localPath.push(route.path);
                // Return the function after localPath push
                return getUrlByPath(route.children, path, joinPaths(localPath));
            }
        }
    }
}
exports.getUrlByPath = getUrlByPath;
/**
 * Get URL by route name and params
 * @returns string
 */
function getUrlByRouteName(pRoutes, pParams) {
    // need to wrap the function to be able to access the preserved "pRoutes" param
    // in local scope after recursion
    var recursiveFn = function (routes, params) {
        var _a, _b;
        for (var i in routes) {
            var route = routes[i];
            var match = (route === null || route === void 0 ? void 0 : route.name) === params.name || ((_a = route.component) === null || _a === void 0 ? void 0 : _a.displayName) === params.name;
            if (match) {
                if (!(route === null || route === void 0 ? void 0 : route.path)) {
                    debug("getUrlByRouteName > There is no route with this name, exit", params.name);
                    return;
                }
                // get full URL
                var urlByPath = getUrlByPath(pRoutes, route.path);
                debug("getUrlByRouteName > urlByPath", urlByPath);
                // build URL with param and return
                var url = buildUrl(urlByPath, params.params);
                debug("getUrlByRouteName > url", url);
                return url;
            }
            // if route has children
            else if (((_b = route.children) === null || _b === void 0 ? void 0 : _b.length) > 0) {
                // getUrlByRouteName > no match, recall recursively on children
                var match_1 = recursiveFn(route.children, params);
                // return recursive Fn only if match, else, continue to next iteration
                if (match_1)
                    return match_1;
            }
        }
    };
    return recursiveFn(pRoutes, pParams);
}
exports.getUrlByRouteName = getUrlByRouteName;
