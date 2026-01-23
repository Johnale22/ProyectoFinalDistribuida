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
const microservices_1 = __webpack_require__(6);
const app_controller_1 = __webpack_require__(7);
const app_service_1 = __webpack_require__(8);
const enrollment_schema_1 = __webpack_require__(10);
// Rate Limiting para seguridad
const throttler_1 = __webpack_require__(11);
const core_1 = __webpack_require__(1);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            // 1. Base de datos Mongo
            mongoose_1.MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://admin:adminpassword@localhost:27017/vinculacion_enrollment?authSource=admin'),
            // Esquema
            mongoose_1.MongooseModule.forFeature([{ name: enrollment_schema_1.Enrollment.name, schema: enrollment_schema_1.EnrollmentSchema }]),
            // 2. Clientes RabbitMQ
            microservices_1.ClientsModule.register([
                {
                    name: 'PROJECT_SERVICE',
                    transport: microservices_1.Transport.RMQ,
                    options: {
                        urls: [`amqp://admin:adminpassword@${process.env.RABBIT_HOST || 'localhost'}:5672`],
                        queue: 'projects_queue',
                        queueOptions: { durable: false },
                    },
                },
                {
                    name: 'NOTIFICATION_SERVICE',
                    transport: microservices_1.Transport.RMQ,
                    options: {
                        urls: [`amqp://admin:adminpassword@${process.env.RABBIT_HOST || 'localhost'}:5672`],
                        queue: 'notification_queue',
                        queueOptions: { durable: false },
                    },
                },
                {
                    name: 'REPORTING_SERVICE',
                    transport: microservices_1.Transport.RMQ,
                    options: {
                        urls: [`amqp://admin:adminpassword@${process.env.RABBIT_HOST || 'localhost'}:5672`],
                        queue: 'reporting_queue',
                        queueOptions: { durable: false },
                    },
                },
            ]),
            // 3. Rate Limit (Seguridad básica)
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 100,
                }]),
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            }
        ],
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
/***/ ((module) => {

module.exports = require("@nestjs/microservices");

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(4);
const app_service_1 = __webpack_require__(8);
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    create(body) {
        return this.appService.create(body);
    }
    getPending() {
        return this.appService.findPending();
    }
    manage(body) {
        return this.appService.manage(body.id, body.status);
    }
    getMyEnrollments(username) {
        return this.appService.findMyEnrollments(username);
    }
    async getApproved() {
        return this.appService.getApproved();
    }
    // ✅ ENDPOINT PARA GUARDAR EL LINK
    // Recibe { studentId: "admin", reportUrl: "http://..." }
    async updateReport(body) {
        try {
            const result = await this.appService.updateReport(body.studentId, body.reportUrl);
            return { success: true, data: result };
        }
        catch (error) {
            return { success: false, message: error.message || 'Error al guardar reporte.' };
        }
    }
};
exports.AppController = AppController;
tslib_1.__decorate([
    (0, common_1.Post)(),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "create", null);
tslib_1.__decorate([
    (0, common_1.Get)('pending'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "getPending", null);
tslib_1.__decorate([
    (0, common_1.Post)('manage'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "manage", null);
tslib_1.__decorate([
    (0, common_1.Get)('student/:username'),
    tslib_1.__param(0, (0, common_1.Param)('username')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "getMyEnrollments", null);
tslib_1.__decorate([
    (0, common_1.Get)('approved'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "getApproved", null);
tslib_1.__decorate([
    (0, common_1.Post)('update-report'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "updateReport", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, common_1.Controller)('enrollment') // Singular, coincide con el Gateway
    ,
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(4);
const mongoose_1 = __webpack_require__(5);
const mongoose_2 = __webpack_require__(9);
const microservices_1 = __webpack_require__(6);
const enrollment_schema_1 = __webpack_require__(10);
let AppService = class AppService {
    constructor(model, projectClient, notificationClient, reportingClient) {
        this.model = model;
        this.projectClient = projectClient;
        this.notificationClient = notificationClient;
        this.reportingClient = reportingClient;
    }
    // ✅ 1. Crear Inscripción (CORREGIDO)
    async create(data) {
        // 🛠️ FIX: Aseguramos que studentId tenga un valor.
        // Si el frontend no manda 'studentId', usamos 'studentName' o 'username' como respaldo.
        const idToUse = data.studentId || data.studentName || data.username;
        if (!idToUse) {
            throw new Error("Error de Validación: Falta el ID del estudiante (studentId).");
        }
        const created = new this.model({
            ...data,
            studentId: idToUse, // ✅ Asignamos explícitamente el ID
            // Aseguramos que studentName también se guarde por si acaso
            studentEmail: data.studentEmail,
            studentName: data.studentName || idToUse,
            status: 'PENDING',
            date: new Date()
        });
        await created.save();
        return { success: true, message: 'Postulación enviada correctamente.' };
    }
    // 2. Buscar Pendientes (Para el Tutor)
    async findPending() {
        const results = await this.model.find({ status: 'PENDING' }).exec();
        return results;
    }
    // 3. Gestionar (Aprobar/Rechazar)
    async manage(id, status) {
        const enrollment = await this.model.findById(id);
        if (!enrollment)
            return { success: false, message: 'Inscripción no encontrada' };
        enrollment.status = status;
        await enrollment.save();
        // BLOQUE A: Si se APRUEBA
        if (status === 'APPROVED') {
            this.projectClient.emit('enrollment_approved', {
                projectId: enrollment.projectId,
                studentName: enrollment.studentName
            });
            this.reportingClient.emit('enrollment_approved', {
                projectId: enrollment.projectId,
                studentId: enrollment.studentId || 'Anonimo',
                date: new Date()
            });
        }
        console.log(`📧 Enviando notificación a: ${enrollment.studentEmail} (Estado: ${status})`);
        // BLOQUE B: Notificar siempre
        this.notificationClient.emit('notify_email', {
            email: enrollment.studentEmail,
            studentName: enrollment.studentName,
            project: enrollment.projectTitle || enrollment.projectId,
            status: status,
            message: status === 'APPROVED'
                ? '¡Felicidades! Tu postulación ha sido aprobada.'
                : 'Lo sentimos, tu postulación ha sido rechazada.'
        });
        return { success: true };
    }
    // ✅ 4. Mis Inscripciones (CORREGIDO)
    findMyEnrollments(username) {
        // Buscamos tanto por 'studentId' como por 'studentName' para asegurar compatibilidad
        return this.model.find({
            $or: [
                { studentId: username },
                { studentName: username }
            ]
        }).exec();
    }
    // 5. Obtener Aprobados
    async getApproved() {
        return this.model.find({ status: 'APPROVED' }).exec();
    }
    // 6. Guardar URL del reporte
    async updateReport(studentId, url) {
        console.log(`📎 Guardando reporte para ${studentId}: ${url}`);
        // Buscamos la inscripción activa (APPROVED)
        const enrollment = await this.model.findOne({
            studentId: studentId,
            status: 'APPROVED'
        }).sort({ createdAt: -1 });
        if (!enrollment) {
            throw new common_1.NotFoundException(`No se encontró una inscripción aprobada para el estudiante: ${studentId}`);
        }
        enrollment.reportUrl = url;
        return enrollment.save();
    }
};
exports.AppService = AppService;
exports.AppService = AppService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, mongoose_1.InjectModel)(enrollment_schema_1.Enrollment.name)),
    tslib_1.__param(1, (0, common_1.Inject)('PROJECT_SERVICE')),
    tslib_1.__param(2, (0, common_1.Inject)('NOTIFICATION_SERVICE')),
    tslib_1.__param(3, (0, common_1.Inject)('REPORTING_SERVICE')),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object, typeof (_b = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _b : Object, typeof (_c = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _c : Object, typeof (_d = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _d : Object])
], AppService);


/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("mongoose");

/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EnrollmentSchema = exports.Enrollment = void 0;
const tslib_1 = __webpack_require__(3);
const mongoose_1 = __webpack_require__(5);
let Enrollment = class Enrollment {
};
exports.Enrollment = Enrollment;
tslib_1.__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    tslib_1.__metadata("design:type", String)
], Enrollment.prototype, "studentId", void 0);
tslib_1.__decorate([
    (0, mongoose_1.Prop)(),
    tslib_1.__metadata("design:type", String)
], Enrollment.prototype, "studentName", void 0);
tslib_1.__decorate([
    (0, mongoose_1.Prop)(),
    tslib_1.__metadata("design:type", String)
], Enrollment.prototype, "studentEmail", void 0);
tslib_1.__decorate([
    (0, mongoose_1.Prop)(),
    tslib_1.__metadata("design:type", Number)
], Enrollment.prototype, "projectId", void 0);
tslib_1.__decorate([
    (0, mongoose_1.Prop)(),
    tslib_1.__metadata("design:type", String)
], Enrollment.prototype, "projectTitle", void 0);
tslib_1.__decorate([
    (0, mongoose_1.Prop)({ default: 'PENDING' }),
    tslib_1.__metadata("design:type", String)
], Enrollment.prototype, "status", void 0);
tslib_1.__decorate([
    (0, mongoose_1.Prop)(),
    tslib_1.__metadata("design:type", String)
], Enrollment.prototype, "reportUrl", void 0);
exports.Enrollment = Enrollment = tslib_1.__decorate([
    (0, mongoose_1.Schema)({ timestamps: true }) // ✅ timestamps: true agrega createdAt y updatedAt automáticos
], Enrollment);
exports.EnrollmentSchema = mongoose_1.SchemaFactory.createForClass(Enrollment);


/***/ }),
/* 11 */
/***/ ((module) => {

module.exports = require("@nestjs/throttler");

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
const core_1 = __webpack_require__(1);
const app_module_1 = __webpack_require__(2);
const microservices_1 = __webpack_require__(6);
const common_1 = __webpack_require__(4);
const swagger_1 = __webpack_require__(12);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // 1. Configuración HTTP
    app.enableCors({ origin: '*' });
    // 2. Validación Global
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    // 3. Swagger
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Microservicio Enrollment')
        .setDescription('Gestión de Matrículas (MongoDB)')
        .setVersion('1.0')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    // ✅ 4. CONFIGURACIÓN RABBITMQ (LISTENER)
    // Escucha mensajes dirigidos a 'enrollment_queue'
    app.connectMicroservice({
        transport: microservices_1.Transport.RMQ,
        options: {
            urls: [`amqp://admin:adminpassword@${process.env.RABBIT_HOST || 'localhost'}:5672`],
            queue: 'enrollment_queue',
            queueOptions: { durable: false },
        },
    });
    await app.startAllMicroservices();
    await app.listen(3002);
    console.log(`🚀 ENROLLMENT SERVICE corriendo en puerto 3002`);
}
bootstrap();

})();

/******/ })()
;