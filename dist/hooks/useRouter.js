"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRootRouter = exports.useRouter = void 0;
var react_1 = require("react");
var Router_1 = require("../components/Router");
var routers_1 = require("../api/routers");
/**
 * Returns current router instance context
 * Instance depend of inside witch provider this function is called
 */
var useRouter = function () { return react_1.useContext(Router_1.RouterContext); };
exports.useRouter = useRouter;
/**
 * Returns root router instance
 */
var useRootRouter = function () { var _a; return (_a = routers_1.ROUTERS.instances) === null || _a === void 0 ? void 0 : _a[0]; };
exports.useRootRouter = useRootRouter;
