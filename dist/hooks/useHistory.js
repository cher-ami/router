"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useHistory = void 0;
var react_1 = require("react");
var routers_1 = require("../api/routers");
var componentName = "useHistory";
var debug = require("debug")("front:" + componentName);
// keep global location history outside the scope
//let locationsHistory = [ROUTERS.history.location];
/**
 * Handle router history
 */
var useHistory = function (callback, deps) {
    if (deps === void 0) { deps = []; }
    var UNLISTEN_HISTORY = react_1.useRef(null);
    var _a = react_1.useState(routers_1.ROUTERS.locationsHistory), history = _a[0], setHistory = _a[1];
    react_1.useEffect(function () {
        // handle history change and keep reference
        UNLISTEN_HISTORY.current = routers_1.ROUTERS.history.listen(function (event) {
            // prepare new history
            var newHistory = __spreadArrays(history, [event.location]);
            // set it in external singleton
            // (because, we need to start history in new useHistory() with the current locationsHistory)
            routers_1.ROUTERS.locationsHistory = newHistory;
            // set in local start returned
            setHistory(newHistory);
            // execute callback if exist
            callback === null || callback === void 0 ? void 0 : callback(event);
        });
        // destroy
        return function () { return UNLISTEN_HISTORY.current(); };
    }, __spreadArrays([history], (deps || [])));
    // return history array
    return history;
};
exports.useHistory = useHistory;
