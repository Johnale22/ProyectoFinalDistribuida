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
// ✅ IMPORTAR: Seguridad Rate Limit
const throttler_1 = __webpack_require__(7);
const core_1 = __webpack_require__(2);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            // ✅ CONFIGURACIÓN: Máximo 10 peticiones por minuto por IP
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 10,
                }]),
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            // ✅ ACTIVAR: Guardián global
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            }
        ],
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

module.exports = require("@nestjs/throttler");

/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("http-proxy-middleware");

/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("express");

/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("@grpc/grpc-js");

/***/ }),
/* 11 */
/***/ ((module) => {

module.exports = require("@grpc/proto-loader");

/***/ }),
/* 12 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 13 */
/***/ ((module) => {

module.exports = require("@nestjs/swagger");

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
const http_proxy_middleware_1 = __webpack_require__(8);
const express = tslib_1.__importStar(__webpack_require__(9));
const grpc = tslib_1.__importStar(__webpack_require__(10));
const protoLoader = tslib_1.__importStar(__webpack_require__(11));
const path_1 = __webpack_require__(12);
// ✅ IMPORTAR: Librerías nuevas
const swagger_1 = __webpack_require__(13);
const common_1 = __webpack_require__(4);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    // ✅ SEGURIDAD: Validación Global
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    // ✅ DOCUMENTACIÓN: Swagger
    const config = new swagger_1.DocumentBuilder()
        .setTitle('API Gateway - Sistema Vinculación')
        .setDescription('Documentación unificada de los microservicios')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    // --- A. gRPC MAPA (LOCATION SERVICE) ---
    const PROTO_PATH = (0, path_1.join)(__dirname, 'assets/location.proto');
    let locationClient = null;
    try {
        const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
            keepCase: true, longs: String, enums: String, defaults: true, oneofs: true
        });
        const locationProto = grpc.loadPackageDefinition(packageDefinition).location;
        // 🐳 DOCKER CHANGE: Usamos variable de entorno para el Host de Location
        const LOCATION_HOST = process.env.LOCATION_HOST || 'localhost';
        locationClient = new locationProto.LocationService(`${LOCATION_HOST}:3007`, // Se conecta a 'location-service:3007' en Docker
        grpc.credentials.createInsecure());
        console.log(`✅ [Gateway] Cliente gRPC conectado a Location (${LOCATION_HOST}:3007)`);
    }
    catch (error) {
        console.warn('⚠️ [Gateway] No se pudo cargar location.proto.');
    }
    // --- B. PROXIES REST (DOCKER READY) ---
    // Usamos variables de entorno. Si no existen, usa localhost (fallback para desarrollo local)
    // 1. AUTH
    const AUTH_URL = process.env.AUTH_URL || 'http://localhost:3000';
    app.use('/auth', (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: AUTH_URL,
        changeOrigin: true,
        pathRewrite: { '^/auth': '' } // 👈 ESTO ES LA MAGIA
    }));
    // 2. PROJECTS (Agrega pathRewrite)
    const PROJECTS_URL = process.env.PROJECTS_URL || 'http://localhost:3001';
    app.use('/projects', (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: PROJECTS_URL,
        changeOrigin: true
    }));
    // 3. ENROLLMENT
    const ENROLLMENT_URL = process.env.ENROLLMENT_URL || 'http://localhost:3002';
    app.use('/enrollment', (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: ENROLLMENT_URL,
        changeOrigin: true
    }));
    // 4. REPORTS
    const REPORTS_URL = process.env.REPORTS_URL || 'http://localhost:3003';
    app.use('/reports', (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: REPORTS_URL,
        changeOrigin: true,
        // ❌ BORRA o COMENTA esta línea:
        // pathRewrite: { '^/reports': '' } 
    }));
    // 5. AUDIT
    const AUDIT_URL = process.env.AUDIT_URL || 'http://localhost:3005';
    app.use('/audit', (0, http_proxy_middleware_1.createProxyMiddleware)({ target: AUDIT_URL, changeOrigin: true }));
    // 6. STORAGE (Gestión de archivos)
    const STORAGE_URL = process.env.STORAGE_URL || 'http://localhost:3006';
    app.use('/storage', (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: STORAGE_URL,
        changeOrigin: true,
        // ❌ BORRA o COMENTA el pathRewrite:
        // pathRewrite: { '^/storage': '' } 
    }));
    // 7. VALIDATION
    const VALIDATION_URL = process.env.VALIDATION_URL || 'http://localhost:3008';
    app.use('/validation', (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: VALIDATION_URL,
        changeOrigin: true,
        pathRewrite: { '^/validation': '' } // ✅ Agregamos Rewrite
    }));
    // Endpoint gRPC manual
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
    console.log(`📄 Documentación en: http://localhost:8080/api/docs`);
}
bootstrap();

})();

/******/ })()
;
//# sourceMappingURL=main.js.map