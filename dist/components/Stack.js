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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stack = void 0;
var react_1 = __importStar(require("react"));
var __1 = require("..");
var componentName = "Stack";
var debug = require("debug")("router:" + componentName);
/**
 * @name Stack
 */
function Stack(props) {
    var _this = this;
    // get current router instance
    var router = __1.useRouter();
    // set number index to component instance
    var _a = react_1.useState(0), index = _a[0], setIndex = _a[1];
    // handle components with refs
    var prevRef = react_1.useRef(null);
    var currentRef = react_1.useRef(null);
    // Create the default sequential transition used
    // if manageTransitions props doesn't exist
    var sequencialTransition = function (_a) {
        var previousPage = _a.previousPage, currentPage = _a.currentPage, unmountPreviousPage = _a.unmountPreviousPage;
        debug(router.id, "start default sequencial transition");
        return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var $current;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        $current = currentPage === null || currentPage === void 0 ? void 0 : currentPage.$element;
                        if ($current)
                            $current.style.visibility = "hidden";
                        if (!previousPage) return [3 /*break*/, 2];
                        return [4 /*yield*/, ((_a = previousPage === null || previousPage === void 0 ? void 0 : previousPage.playOut) === null || _a === void 0 ? void 0 : _a.call(previousPage))];
                    case 1:
                        _d.sent();
                        unmountPreviousPage();
                        _d.label = 2;
                    case 2: return [4 /*yield*/, ((_b = currentPage === null || currentPage === void 0 ? void 0 : currentPage.isReadyPromise) === null || _b === void 0 ? void 0 : _b.call(currentPage))];
                    case 3:
                        _d.sent();
                        if ($current)
                            $current.style.visibility = "visible";
                        return [4 /*yield*/, ((_c = currentPage === null || currentPage === void 0 ? void 0 : currentPage.playIn) === null || _c === void 0 ? void 0 : _c.call(currentPage))];
                    case 4:
                        _d.sent();
                        resolve();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    // choose transition
    var selectedTransition = react_1.useMemo(function () { return (props.manageTransitions ? props.manageTransitions : sequencialTransition); }, [props.manageTransitions]);
    // 1 get routes
    var _b = __1.useRoute(function () {
        setIndex(index + 1);
    }, [index]), previousRoute = _b.previousRoute, setPreviousRoute = _b.setPreviousRoute, currentRoute = _b.currentRoute;
    // 2. animate when route state changed
    // need to be "layoutEffect" to play transitions before render, to avoid screen "clip"
    react_1.useLayoutEffect(function () {
        debug(router.id, "routes", { previousRoute: previousRoute, currentRoute: currentRoute });
        if (!currentRoute) {
            debug(router.id, "current route doesn't exist, return.");
            return;
        }
        // prepare unmount function
        var unmountPreviousPage = function () {
            setPreviousRoute(null);
        };
        // emit to router event stack animating start state
        router.events.emit(__1.ERouterEvent.STACK_IS_ANIMATING, true);
        // start selected transition
        selectedTransition({
            previousPage: prevRef.current,
            currentPage: currentRef.current,
            unmountPreviousPage: unmountPreviousPage,
        })
            // when transitions are ended
            .then(function () {
            debug(router.id, "manageTransitions promise resolve!");
            // if previous page wasn't unmount manually, we force unmount here
            unmountPreviousPage();
            // emit to router event stack animating end state
            router.events.emit(__1.ERouterEvent.STACK_IS_ANIMATING, false);
        });
    }, [currentRoute]);
    return (react_1.default.createElement("div", { className: [componentName, props.className].filter(function (e) { return e; }).join(" ") },
        (previousRoute === null || previousRoute === void 0 ? void 0 : previousRoute.component) && (react_1.default.createElement(previousRoute.component, __assign({ ref: prevRef, key: previousRoute.fullUrl + "_" + (index - 1) }, (previousRoute.props || {})))),
        (currentRoute === null || currentRoute === void 0 ? void 0 : currentRoute.component) && (react_1.default.createElement(currentRoute.component, __assign({ ref: currentRef, key: currentRoute.fullUrl + "_" + index }, (currentRoute.props || {}))))));
}
exports.Stack = Stack;
