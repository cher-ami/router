"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROUTERS = void 0;
/**
 * ROUTERS object allows to keep safe globales values between routers instances
 * This object values do not depend of one single router
 */
exports.ROUTERS = {
    routes: null,
    instances: [],
    history: null,
    locationsHistory: [],
    routeCounter: 1,
    isFirstRoute: true,
};
