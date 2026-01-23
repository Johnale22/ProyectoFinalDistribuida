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
const app_controller_1 = __webpack_require__(5);
const app_service_1 = __webpack_require__(7);
// ✅ Importamos ClientsModule para conectarnos a RabbitMQ
const microservices_1 = __webpack_require__(9);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            // ✅ Cliente RabbitMQ (Para hablar con Notification Service)
            microservices_1.ClientsModule.register([
                {
                    name: 'NOTIFICATION_SERVICE',
                    transport: microservices_1.Transport.RMQ,
                    options: {
                        urls: [`amqp://admin:adminpassword@${process.env.RABBIT_HOST || 'localhost'}:5672`],
                        queue: 'notification_queue',
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
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(4);
const platform_express_1 = __webpack_require__(6);
const app_service_1 = __webpack_require__(7);
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    async uploadFile(file, studentId // Recibimos el ID del estudiante
    ) {
        if (!file) {
            return { success: false, message: 'No se recibió ningún archivo' };
        }
        // Llamamos a TU servicio de MinIO
        const id = studentId || 'anonimo';
        return await this.appService.uploadFile(file, id);
    }
};
exports.AppController = AppController;
tslib_1.__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')) // Sin diskStorage = Memoria (Buffer disponible)
    ,
    tslib_1.__param(0, (0, common_1.UploadedFile)()),
    tslib_1.__param(1, (0, common_1.Body)('studentId')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_c = typeof Express !== "undefined" && (_b = Express.Multer) !== void 0 && _b.File) === "function" ? _c : Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "uploadFile", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, common_1.Controller)('storage') // <--- Prefijo que coincide con Gateway
    ,
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("@nestjs/platform-express");

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(4);
const client_s3_1 = __webpack_require__(8);
const microservices_1 = __webpack_require__(9);
let AppService = class AppService {
    constructor(notificationClient) {
        this.notificationClient = notificationClient;
        this.BUCKET_NAME = 'vinculacion-docs';
        // ✅ Leemos el endpoint desde Docker (será 'uceminio')
        const minioHost = process.env.MINIO_ENDPOINT || 'localhost';
        this.s3 = new client_s3_1.S3Client({
            region: 'us-east-1',
            endpoint: `http://${minioHost}:9000`, // Resultado: http://uceminio:9000
            credentials: {
                // ✅ CORRECCIÓN CLAVE: accessKeyId (Para SDK V3)
                // Usamos las variables definidas en docker-compose
                accessKeyId: process.env.MINIO_ACCESS_KEY || 'admin',
                secretAccessKey: process.env.MINIO_SECRET_KEY || 'adminpassword',
            },
            forcePathStyle: true, // Requerido para MinIO
        });
    }
    async onModuleInit() {
        await this.initBucket();
    }
    async initBucket() {
        try {
            await this.s3.send(new client_s3_1.HeadBucketCommand({ Bucket: this.BUCKET_NAME }));
            console.log(`✅ Bucket '${this.BUCKET_NAME}' verificado.`);
        }
        catch (error) {
            console.log(`⚠️ Bucket no encontrado. Creando '${this.BUCKET_NAME}'...`);
            try {
                await this.s3.send(new client_s3_1.CreateBucketCommand({ Bucket: this.BUCKET_NAME }));
                console.log(`📂 Bucket creado exitosamente.`);
            }
            catch (createError) {
                console.error("❌ Error fatal creando el bucket:", createError.message);
                return;
            }
        }
        // Configurar política pública (Lectura)
        const policy = {
            Version: "2012-10-17",
            Statement: [
                {
                    Sid: "PublicRead",
                    Effect: "Allow",
                    Principal: "*",
                    Action: ["s3:GetObject"],
                    Resource: [`arn:aws:s3:::${this.BUCKET_NAME}/*`]
                }
            ]
        };
        try {
            await this.s3.send(new client_s3_1.PutBucketPolicyCommand({
                Bucket: this.BUCKET_NAME,
                Policy: JSON.stringify(policy)
            }));
            console.log("🌍 Bucket configurado como PÚBLICO.");
        }
        catch (policyError) {
            // Ignorar si ya existe
        }
    }
    async uploadFile(file, studentId) {
        // Limpiamos el nombre del archivo
        const safeName = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '');
        const fileName = `${Date.now()}-${safeName}`;
        const key = `uploads/${studentId}/${fileName}`;
        try {
            await this.s3.send(new client_s3_1.PutObjectCommand({
                Bucket: this.BUCKET_NAME,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            }));
            // ✅ URL para el frontend (usamos localhost porque el usuario entra desde su navegador)
            const publicUrl = `http://localhost:9000/${this.BUCKET_NAME}/${key}`;
            return {
                success: true,
                url: publicUrl,
                fileName: fileName,
                message: 'Archivo subido correctamente'
            };
        }
        catch (error) {
            console.error("❌ Error subiendo a S3:", error);
            return { success: false, message: 'Error interno al subir archivo' };
        }
    }
};
exports.AppService = AppService;
exports.AppService = AppService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, common_1.Inject)('NOTIFICATION_SERVICE')),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _a : Object])
], AppService);


/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("@aws-sdk/client-s3");

/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("@nestjs/microservices");

/***/ }),
/* 10 */
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
// ✅ Importamos tipos para Swagger y documentación
const swagger_1 = __webpack_require__(10);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // 1. Habilitar CORS
    app.enableCors({ origin: '*' });
    // 2. Configurar Swagger
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Microservicio Storage')
        .setDescription('Gestión de Archivos (MinIO S3)')
        .setVersion('1.0')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    // ✅ 3. CONEXIÓN A RABBITMQ (Listener)
    app.connectMicroservice({
        transport: microservices_1.Transport.RMQ,
        options: {
            urls: [`amqp://admin:adminpassword@${process.env.RABBIT_HOST || 'localhost'}:5672`],
            queue: 'storage_queue',
            queueOptions: { durable: false },
        },
    });
    await app.startAllMicroservices();
    await app.listen(3006);
    console.log(`🚀 STORAGE SERVICE corriendo en puerto 3006`);
}
bootstrap();

})();

/******/ })()
;