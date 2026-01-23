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


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(4);
const client_s3_1 = __webpack_require__(8);
let AppService = class AppService {
    constructor() {
        this.BUCKET_NAME = 'vinculacion-docs';
        // Configuración para MinIO
        this.s3 = new client_s3_1.S3Client({
            region: 'us-east-1',
            endpoint: 'http://localhost:9000',
            credentials: {
                accessKeyId: 'admin',
                secretAccessKey: 'adminpassword',
            },
            forcePathStyle: true,
        });
    }
    // --- AUTOMATIZACIÓN AL INICIAR ---
    async onModuleInit() {
        await this.initBucket();
    }
    async initBucket() {
        try {
            // 1. Verificar si existe el bucket
            await this.s3.send(new client_s3_1.HeadBucketCommand({ Bucket: this.BUCKET_NAME }));
            console.log(`✅ Bucket '${this.BUCKET_NAME}' ya existe.`);
        }
        catch (error) {
            // Si falla (error 404), es porque no existe -> Lo creamos
            console.log(`⚠️ El bucket no existe. Creando '${this.BUCKET_NAME}'...`);
            try {
                await this.s3.send(new client_s3_1.CreateBucketCommand({ Bucket: this.BUCKET_NAME }));
                console.log(`📂 Bucket creado exitosamente.`);
            }
            catch (createError) {
                console.error("❌ Error fatal creando el bucket:", createError);
                return;
            }
        }
        // 2. APLICAR POLÍTICA PÚBLICA
        console.log("🔓 Aplicando política de acceso público...");
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
            console.log("🌍 Bucket configurado como PÚBLICO automáticamente.");
        }
        catch (policyError) {
            console.error("❌ Error aplicando política pública:", policyError);
        }
    }
    async uploadFile(file, studentId) {
        // Usamos timestamp para evitar nombres duplicados
        const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
        const key = `uploads/${studentId}/${fileName}`;
        try {
            await this.s3.send(new client_s3_1.PutObjectCommand({
                Bucket: this.BUCKET_NAME,
                Key: key,
                Body: file.buffer, // <--- Importante: Multer debe darnos el buffer
                ContentType: file.mimetype,
            }));
            // Generamos la URL pública
            const fileUrl = `http://localhost:9000/${this.BUCKET_NAME}/${key}`;
            return { success: true, url: fileUrl, message: 'Archivo subido correctamente' };
        }
        catch (error) {
            console.error("Error subiendo a S3:", error);
            return { success: false, message: 'Error al subir archivo' };
        }
    }
};
exports.AppService = AppService;
exports.AppService = AppService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [])
], AppService);


/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("@aws-sdk/client-s3");

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
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors(); // Habilitar CORS
    await app.listen(3006);
    console.log(`🚀 STORAGE SERVICE (MinIO S3) listo en puerto 3006`);
}
bootstrap();

})();

/******/ })()
;