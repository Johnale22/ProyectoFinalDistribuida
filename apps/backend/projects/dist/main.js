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
const typeorm_1 = __webpack_require__(5);
const project_entity_1 = __webpack_require__(6);
const app_controller_1 = __webpack_require__(8);
const app_service_1 = __webpack_require__(10);
// ✅ IMPORTAR ESTAS LIBRERÍAS FALTANTES
const microservices_1 = __webpack_require__(9);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            // 1. Base de Datos
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST || 'uce_postgres',
                port: 5432,
                username: 'admin',
                password: 'adminpassword',
                database: process.env.DB_NAME || 'vinculacion_db',
                autoLoadEntities: true,
                synchronize: true,
            }),
            typeorm_1.TypeOrmModule.forFeature([project_entity_1.Project]),
            // ✅ 2. CLIENTE RABBITMQ (Para enviar mensajes)
            // Esto permite que 'Projects' le hable a 'Notifications' u otros
            microservices_1.ClientsModule.register([
                {
                    name: 'NOTIFICATION_SERVICE', // Nombre para inyectar en el servicio
                    transport: microservices_1.Transport.RMQ,
                    options: {
                        urls: [`amqp://admin:adminpassword@${process.env.RABBIT_HOST || 'localhost'}:5672`],
                        queue: 'notification_queue', // Cola a la que enviaremos mensajes
                        queueOptions: { durable: false },
                    },
                },
            ]),
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

module.exports = require("@nestjs/typeorm");

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Project = void 0;
const tslib_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(7);
let Project = class Project {
};
exports.Project = Project;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    tslib_1.__metadata("design:type", Number)
], Project.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], Project.prototype, "title", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)("text"),
    tslib_1.__metadata("design:type", String)
], Project.prototype, "description", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", Number)
], Project.prototype, "max_quota", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    tslib_1.__metadata("design:type", Number)
], Project.prototype, "enrolled", void 0);
exports.Project = Project = tslib_1.__decorate([
    (0, typeorm_1.Entity)()
], Project);


/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("typeorm");

/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(4);
const microservices_1 = __webpack_require__(9);
const app_service_1 = __webpack_require__(10);
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    // --- HTTP (Para el Frontend) ---
    findAll() { return this.appService.findAll(); }
    create(body) { return this.appService.create(body); }
    // --- RABBITMQ (Interno) ---
    handleEnrollmentApproved(data) {
        // Recibimos el aviso de Enrollment y ejecutamos la lógica
        this.appService.reduceQuota(data.projectId);
    }
};
exports.AppController = AppController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "findAll", null);
tslib_1.__decorate([
    (0, common_1.Post)(),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "create", null);
tslib_1.__decorate([
    (0, microservices_1.EventPattern)('enrollment_approved'),
    tslib_1.__param(0, (0, microservices_1.Payload)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "handleEnrollmentApproved", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, common_1.Controller)('projects'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("@nestjs/microservices");

/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(5);
const typeorm_2 = __webpack_require__(7);
const project_entity_1 = __webpack_require__(6);
let AppService = class AppService {
    constructor(projectRepo) {
        this.projectRepo = projectRepo;
    }
    // HTTP: Listar
    findAll() { return this.projectRepo.find(); }
    // HTTP: Crear
    create(data) {
        console.log("💾 [Projects] Guardando nuevo proyecto:", data.title);
        return this.projectRepo.save(this.projectRepo.create(data));
    }
    // RABBITMQ: Reducir Cupo
    async reduceQuota(projectId) {
        const id = Number(projectId);
        const project = await this.projectRepo.findOneBy({ id });
        if (project) {
            project.enrolled += 1;
            await this.projectRepo.save(project);
            console.log(`🐰 [Projects] Cupo actualizado. Proyecto #${id} tiene ${project.enrolled} inscritos.`);
        }
    }
};
exports.AppService = AppService;
exports.AppService = AppService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], AppService);


/***/ }),
/* 11 */
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
const microservices_1 = __webpack_require__(9);
const common_1 = __webpack_require__(4);
const swagger_1 = __webpack_require__(11);
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
        .setTitle('Microservicio Projects')
        .setDescription('Gestión de proyectos')
        .setVersion('1.0')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    // ✅ 4. CONFIGURACIÓN RABBITMQ (LISTENER)
    // Esto hace que el servicio "escuche" en la cola 'projects_queue'
    app.connectMicroservice({
        transport: microservices_1.Transport.RMQ,
        options: {
            // Usa la variable de entorno o falla a localhost (para desarrollo local)
            urls: [`amqp://admin:adminpassword@${process.env.RABBIT_HOST || 'localhost'}:5672`],
            queue: 'projects_queue',
            queueOptions: { durable: false },
        },
    });
    await app.startAllMicroservices();
    await app.listen(3001);
    console.log(`🚀 PROJECTS SERVICE corriendo en puerto 3001`);
}
bootstrap();

})();

/******/ })()
;