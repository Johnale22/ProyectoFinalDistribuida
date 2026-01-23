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
const axios_1 = __webpack_require__(5); // <--- IMPORTAR ESTO
const app_controller_1 = __webpack_require__(6);
const app_service_1 = __webpack_require__(8);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [axios_1.HttpModule], // <--- AGREGAR AQUÍ
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

module.exports = require("@nestjs/axios");

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
let AppController = class AppController {
    appService;
    constructor(appService) {
        this.appService = appService;
    }
    handleEmail(data) {
        this.appService.sendEmail(data);
    }
};
exports.AppController = AppController;
tslib_1.__decorate([
    (0, microservices_1.EventPattern)('notify_email'),
    tslib_1.__param(0, (0, microservices_1.Payload)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "handleEmail", null);
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
const axios_1 = __webpack_require__(5);
const rxjs_1 = __webpack_require__(9);
let AppService = class AppService {
    httpService;
    constructor(httpService) {
        this.httpService = httpService;
    }
    // CAMBIA ESTO POR TU URL REAL DE N8N CUANDO LO TENGAS
    n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/correo-vinculacion';
    async sendWelcomeEmail(email, name) {
        console.log(`🚀 Enviando datos a n8n para dar la bienvenida a: ${email}`);
        try {
            await (0, rxjs_1.lastValueFrom)(this.httpService.post(this.n8nWebhookUrl, {
                type: 'WELCOME',
                email: email,
                name: name,
                message: 'Bienvenido al Sistema de Vinculación UCE'
            }));
            console.log('✅ Webhook de n8n disparado exitosamente.');
        }
        catch (error) {
            console.error('❌ Error contactando a n8n. ¿Está prendido?', error.message);
        }
    }
    async sendApprovalEmail(email, project) {
        console.log(`🚀 Enviando datos a n8n para aprobación de: ${email}`);
        try {
            await (0, rxjs_1.lastValueFrom)(this.httpService.post(this.n8nWebhookUrl, {
                type: 'APPROVAL',
                email: email,
                project: project,
                message: 'Tu postulación ha sido APROBADA.'
            }));
            console.log('✅ Webhook de n8n disparado exitosamente.');
        }
        catch (error) {
            console.error('❌ Error contactando a n8n:', error.message);
        }
    }
};
exports.AppService = AppService;
exports.AppService = AppService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object])
], AppService);


/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("rxjs");

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
    // Conectar a RabbitMQ
    app.connectMicroservice({
        transport: microservices_1.Transport.RMQ,
        options: {
            urls: [process.env.RABBITMQ_URL || 'amqp://admin:adminpassword@localhost:5672'],
            queue: 'notification_queue', // Debe coincidir con Enrollment
            queueOptions: {
                durable: false,
            },
        },
    });
    await app.startAllMicroservices();
    await app.listen(3004);
    console.log(`🚀 NOTIFICATION SERVICE listo en puerto 3004`);
}
bootstrap();

})();

/******/ })()
;
//# sourceMappingURL=main.js.map