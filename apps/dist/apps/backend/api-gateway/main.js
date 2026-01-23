/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(4);
const app_controller_1 = __webpack_require__(5);
const app_service_1 = __webpack_require__(6);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);


/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(4);
const app_service_1 = __webpack_require__(6);
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    getData() {
        return this.appService.getData();
    }
};
exports.AppController = AppController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "getData", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, common_1.Controller)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(4);
let AppService = class AppService {
    getData() {
        return { message: 'Hello API' };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], AppService);


/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("http-proxy-middleware");

/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("express");

/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("@grpc/grpc-js");

/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("@grpc/proto-loader");

/***/ }),
/* 11 */
/***/ ((module) => {

module.exports = require("path");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const core_1 = __webpack_require__(2);
const app_module_1 = __webpack_require__(3);
const http_proxy_middleware_1 = __webpack_require__(7);
const express = tslib_1.__importStar(__webpack_require__(8));
const grpc = tslib_1.__importStar(__webpack_require__(9));
const protoLoader = tslib_1.__importStar(__webpack_require__(10));
const path_1 = __webpack_require__(11);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    // --- A. gRPC MAPA ---
    const PROTO_PATH = (0, path_1.join)(__dirname, 'assets/location.proto');
    let locationClient = null;
    try {
        const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
            keepCase: true, longs: String, enums: String, defaults: true, oneofs: true
        });
        const locationProto = grpc.loadPackageDefinition(packageDefinition).location;
        // Ajuste: Asegúrate de que el puerto sea el correcto (3007)
        locationClient = new locationProto.LocationService('localhost:3007', grpc.credentials.createInsecure());
        console.log('✅ [Gateway] Cliente gRPC conectado a Location (3007)');
    }
    catch (error) {
        console.warn('⚠️ [Gateway] No se pudo cargar location.proto.');
    }
    // --- B. PROXIES REST ---
    // 1. Auth (Puerto 3000)
    app.use('/auth', (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: 'http://localhost:3000',
        changeOrigin: true
    }));
    // 2. Projects (Puerto 3001)
    app.use('/projects', (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: 'http://localhost:3001',
        changeOrigin: true
    }));
    // 3. Enrollment (Puerto 3002) - CON REWRITE
    app.use('/enrollment', (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: 'http://localhost:3002',
        changeOrigin: true,
        pathRewrite: { '^/enrollment': '/enrollments' }
    }));
    // 4. Reports (Puerto 3003)
    app.use('/reports', (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: 'http://localhost:3003',
        changeOrigin: true
    }));
    // 5. Audit (Puerto 3005)
    app.use('/audit', (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: 'http://localhost:3005',
        changeOrigin: true
    }));
    // 6. Storage (Puerto 3006)
    app.use('/storage', (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: 'http://localhost:3006',
        changeOrigin: true,
    }));
    // 7. Validation (Puerto 3008)
    app.use('/validation', (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: 'http://localhost:3008',
        changeOrigin: true
    }));
    // --- CORRECCIÓN AQUÍ ABAJO ---
    // Endpoint gRPC manual con tipos explícitos
    app.use('/location/calc', express.json(), (req, res, next) => {
        if (req.method !== 'POST')
            return next();
        if (!locationClient)
            return res.status(503).json({ message: 'Location Service off' });
        const { lat1, lon1, lat2, lon2 } = req.body;
        locationClient.CalculateDistance({ lat1, lon1, lat2, lon2 }, (err, response) => {
            if (err)
                return res.status(500).json({ error: err.message });
            res.json(response);
        });
    });
    await app.listen(8080);
    console.log(`🚀 API GATEWAY listo en: http://localhost:8080`);
}
bootstrap();

})();

/******/ })()
;