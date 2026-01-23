/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("reflect-metadata");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(5);
const mongoose_1 = __webpack_require__(6);
const app_controller_1 = __webpack_require__(7);
const app_service_1 = __webpack_require__(9);
const audit_schema_1 = __webpack_require__(11);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            // ✅ CONEXIÓN ROBUSTA A MONGO (Para Docker)
            mongoose_1.MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://admin:adminpassword@uce_mongo:27017/vinculacion_audit?authSource=admin'),
            mongoose_1.MongooseModule.forFeature([{ name: audit_schema_1.AuditLog.name, schema: audit_schema_1.AuditLogSchema }]),
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);


/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("@nestjs/mongoose");

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(5);
const microservices_1 = __webpack_require__(8);
const app_service_1 = __webpack_require__(9);
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    // 1. HTTP GET: Para que el Admin vea la tabla
    async getAuditLogs() {
        return this.appService.getLogs();
    }
    // 2. RABBITMQ: Escucha universal
    // Cualquier servicio que emita 'audit_log' caerá aquí
    async handleAuditLog(data) {
        // data debe tener { action: "...", user: "...", ... }
        const action = data.action || 'UNKNOWN_EVENT';
        await this.appService.logEvent(action, data);
    }
};
exports.AppController = AppController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "getAuditLogs", null);
tslib_1.__decorate([
    (0, microservices_1.EventPattern)('audit_log'),
    tslib_1.__param(0, (0, microservices_1.Payload)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "handleAuditLog", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, common_1.Controller)('audit') // ✅ El endpoint queda como /audit
    ,
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("@nestjs/microservices");

/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(5);
const mongoose_1 = __webpack_require__(6);
const mongoose_2 = __webpack_require__(10);
const audit_schema_1 = __webpack_require__(11);
let AppService = class AppService {
    constructor(auditModel) {
        this.auditModel = auditModel;
    }
    // 1. Guardar un evento (Viene desde RabbitMQ)
    async logEvent(action, data) {
        console.log(`📝 [Audit] Guardando en Mongo: ${action}`);
        const newLog = new this.auditModel({
            action: action,
            // Intentamos sacar el usuario del payload, si no existe ponemos 'Sistema'
            user: data.user || data.studentId || data.username || 'Sistema',
            data: data.payload || data, // Guardamos el resto de datos
            ip: data.ip || 'Internal'
        });
        return newLog.save();
    }
    // 2. Leer historial (Para el Dashboard de Admin)
    async getLogs() {
        // Devolvemos los últimos 100 registros, ordenados del más reciente al más antiguo
        return this.auditModel.find().sort({ timestamp: -1 }).limit(100).exec();
    }
};
exports.AppService = AppService;
exports.AppService = AppService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, mongoose_1.InjectModel)(audit_schema_1.AuditLog.name)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object])
], AppService);


/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("mongoose");

/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuditLogSchema = exports.AuditLog = void 0;
const tslib_1 = __webpack_require__(4);
const mongoose_1 = __webpack_require__(6);
// ✅ Usamos timestamps para que Mongo guarde la fecha solo
let AuditLog = class AuditLog {
};
exports.AuditLog = AuditLog;
tslib_1.__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    tslib_1.__metadata("design:type", String)
], AuditLog.prototype, "action", void 0);
tslib_1.__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    tslib_1.__metadata("design:type", String)
], AuditLog.prototype, "user", void 0);
tslib_1.__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    tslib_1.__metadata("design:type", Object)
], AuditLog.prototype, "data", void 0);
tslib_1.__decorate([
    (0, mongoose_1.Prop)(),
    tslib_1.__metadata("design:type", String)
], AuditLog.prototype, "ip", void 0);
exports.AuditLog = AuditLog = tslib_1.__decorate([
    (0, mongoose_1.Schema)({ timestamps: { createdAt: 'timestamp', updatedAt: false } })
], AuditLog);
exports.AuditLogSchema = mongoose_1.SchemaFactory.createForClass(AuditLog);


/***/ }),
/* 12 */
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
__webpack_require__(1);
const core_1 = __webpack_require__(2);
const app_module_1 = __webpack_require__(3);
const microservices_1 = __webpack_require__(8);
const common_1 = __webpack_require__(5);
const swagger_1 = __webpack_require__(12);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // 1. Configuración HTTP y CORS
    app.enableCors({ origin: '*' });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    // 2. Swagger (Opcional)
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Audit Service')
        .setDescription('Microservicio de Auditoría (MongoDB)')
        .setVersion('1.0')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    // 3. Conectar a RabbitMQ (CORREGIDO PARA DOCKER)
    app.connectMicroservice({
        transport: microservices_1.Transport.RMQ,
        options: {
            // ✅ Si no hay variable, usa uce_rabbitmq
            urls: [`amqp://admin:adminpassword@${process.env.RABBIT_HOST || 'uce_rabbitmq'}:5672`],
            queue: 'audit_queue',
            queueOptions: { durable: false },
        },
    });
    await app.startAllMicroservices();
    await app.listen(3005);
    console.log(`🚀 AUDIT SERVICE listo en puerto 3005`);
}
bootstrap();

})();

/******/ })()
;