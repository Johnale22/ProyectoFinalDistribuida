/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(4);
const mongoose_1 = __webpack_require__(5);
const app_controller_1 = __webpack_require__(6);
const app_service_1 = __webpack_require__(8);
const reporting_schema_1 = __webpack_require__(10);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            // Base de datos SOLO para reportes (CQRS Read Side)
            mongoose_1.MongooseModule.forRoot('mongodb://admin:adminpassword@localhost:27017/vinculacion_reports?authSource=admin'),
            mongoose_1.MongooseModule.forFeature([{ name: reporting_schema_1.Report.name, schema: reporting_schema_1.ReportSchema }]),
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);


/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("@nestjs/mongoose");

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(4);
const microservices_1 = __webpack_require__(7);
const app_service_1 = __webpack_require__(8);
// --- DEJAR VACÍO ---
// El Gateway ya convirtió "/reports" en "/"
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    async getDashboardStats() {
        return this.appService.getStats();
    }
    async handleEnrollmentApproved(data) {
        console.log('⚡ Reporting: Inscripción aprobada', data);
        await this.appService.incrementApprovedStats(data);
    }
};
exports.AppController = AppController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "getDashboardStats", null);
tslib_1.__decorate([
    (0, microservices_1.EventPattern)('enrollment_approved'),
    tslib_1.__param(0, (0, microservices_1.Payload)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "handleEnrollmentApproved", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, common_1.Controller)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("@nestjs/microservices");

/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(4);
const mongoose_1 = __webpack_require__(5);
const mongoose_2 = __webpack_require__(9);
const reporting_schema_1 = __webpack_require__(10);
let AppService = class AppService {
    constructor(reportModel) {
        this.reportModel = reportModel;
    }
    async onModuleInit() {
        // Si no hay datos, creamos unos iniciales para probar
        const exists = await this.reportModel.findOne();
        if (!exists) {
            await this.reportModel.create({
                totalStudents: 100,
                totalProjects: 15,
                approvedEnrollments: 5,
                projectsByFaculty: { 'Ingeniería': 5, 'Medicina': 3 }
            });
            console.log('📊 Estadísticas iniciales creadas en Mongo');
        }
    }
    async getStats() {
        return this.reportModel.findOne().exec();
    }
    async incrementApprovedStats(data) {
        const stats = await this.reportModel.findOne();
        if (stats) {
            stats.approvedEnrollments += 1;
            await stats.save();
            console.log('📈 Estadísticas actualizadas (+1 Aprobado)');
        }
    }
};
exports.AppService = AppService;
exports.AppService = AppService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, mongoose_1.InjectModel)(reporting_schema_1.Report.name)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object])
], AppService);


/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("mongoose");

/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReportSchema = exports.Report = void 0;
const tslib_1 = __webpack_require__(3);
const mongoose_1 = __webpack_require__(5);
let Report = class Report {
};
exports.Report = Report;
tslib_1.__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    tslib_1.__metadata("design:type", Number)
], Report.prototype, "totalStudents", void 0);
tslib_1.__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    tslib_1.__metadata("design:type", Number)
], Report.prototype, "totalProjects", void 0);
tslib_1.__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    tslib_1.__metadata("design:type", Number)
], Report.prototype, "approvedEnrollments", void 0);
tslib_1.__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    tslib_1.__metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], Report.prototype, "projectsByFaculty", void 0);
exports.Report = Report = tslib_1.__decorate([
    (0, mongoose_1.Schema)()
], Report);
exports.ReportSchema = mongoose_1.SchemaFactory.createForClass(Report);


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
const core_1 = __webpack_require__(1);
const app_module_1 = __webpack_require__(2);
const microservices_1 = __webpack_require__(7);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // 1. Conectar a RabbitMQ (Para escuchar eventos)
    app.connectMicroservice({
        transport: microservices_1.Transport.RMQ,
        options: {
            urls: ['amqp://admin:adminpassword@localhost:5672'],
            queue: 'reporting_queue',
            queueOptions: { durable: false },
        },
    });
    // 2. Iniciar servidor HTTP en 3003
    app.enableCors();
    await app.startAllMicroservices();
    await app.listen(3003);
    console.log(`🚀 REPORTING SERVICE listo en puerto 3003`);
}
bootstrap();

})();

/******/ })()
;
//# sourceMappingURL=main.js.map