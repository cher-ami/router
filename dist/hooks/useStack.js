"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStack = void 0;
var react_1 = require("react");
var componentName = "useStack";
var debug = require("debug")("router:" + componentName);
/**
 * @name useStack
 * @description Allow to Stack component to handle page information object
 */
var useStack = function (_a) {
    var componentName = _a.componentName, _b = _a.playIn, playIn = _b === void 0 ? function () { return Promise.resolve(); } : _b, _c = _a.playOut, playOut = _c === void 0 ? function () { return Promise.resolve(); } : _c, handleRef = _a.handleRef, rootRef = _a.rootRef, _d = _a.isReady, isReady = _d === void 0 ? true : _d;
    // create deferred promise who we can resolve in the scope
    var deferredPromise = react_1.useMemo(function () {
        var deferred = {};
        deferred.promise = new Promise(function (resolve) {
            deferred.resolve = resolve;
        });
        return deferred;
    }, []);
    // resolve deferred if isReady param is true
    react_1.useEffect(function () {
        isReady && deferredPromise.resolve();
    }, [isReady]);
    react_1.useImperativeHandle(handleRef, function () {
        // Objects properties will be used by Stack
        var handleRouteCallback = {
            componentName: componentName,
            playIn: playIn,
            playOut: playOut,
            isReady: isReady,
            isReadyPromise: function () { return deferredPromise.promise; },
            $element: rootRef.current,
        };
        return handleRouteCallback;
    }, [deferredPromise]);
};
exports.useStack = useStack;
