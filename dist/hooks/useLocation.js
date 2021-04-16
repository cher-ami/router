"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLocation = void 0;
var react_1 = require("react");
var __1 = require("..");
var helpers_1 = require("../api/helpers");
var routers_1 = require("../api/routers");
var componentName = "useLocation";
var debug = require("debug")("router:" + componentName);
/**
 * useLocation
 */
var useLocation = function () {
    var rootRouter = __1.useRootRouter();
    /**
     * Get dynamic current location
     */
    var _a = react_1.useState(routers_1.ROUTERS.history.location.pathname), location = _a[0], setLoc = _a[1];
    __1.useHistory(function (event) {
        setLoc(event.location.pathname);
    }, []);
    /**
     * Prepare setLocation function, who push in history
     * @param args
     */
    function setLocation(args) {
        var urlToPush;
        // prepare URL
        if (typeof args === "string") {
            urlToPush = args;
        }
        else if (typeof args === "object" && args.name) {
            urlToPush = helpers_1.getUrlByRouteName(rootRouter.routes, args);
        }
        else {
            throw new Error("ERROR: setLocation param isn't valid. return.");
        }
        routers_1.ROUTERS.history.push(urlToPush);
    }
    return [location, setLocation];
};
exports.useLocation = useLocation;
