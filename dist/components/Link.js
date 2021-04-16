"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Link = void 0;
var react_1 = __importDefault(require("react"));
var __1 = require("..");
var componentName = "Link";
var debug = require("debug")("router:" + componentName);
/**
 * @name Link
 */
function Link(props) {
    var _a = __1.useLocation(), location = _a[0], setLocation = _a[1];
    var handleClick = function (e) {
        var _a;
        e.preventDefault();
        (_a = props.onClick) === null || _a === void 0 ? void 0 : _a.call(props);
        setLocation(props.to);
    };
    return (react_1.default.createElement("a", { className: [componentName, props.className, location === props.to && "active"]
            .filter(function (e) { return e; })
            .join(" "), onClick: handleClick, href: props.to, children: props.children }));
}
exports.Link = Link;
