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
const microservices_1 = __webpack_require__(6);
const user_entity_1 = __webpack_require__(7);
const app_controller_1 = __webpack_require__(9);
const app_service_1 = __webpack_require__(10);
const jwt_1 = __webpack_require__(11);
// ✅ IMPORTAR RATE LIMITING
const throttler_1 = __webpack_require__(12);
const core_1 = __webpack_require__(1);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            // 1. Base de Datos (CORREGIDA PARA DOCKER)
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST || 'localhost', // Docker usa 'uce_postgres'
                port: 5432,
                username: 'admin',
                password: 'adminpassword',
                // ⚠️ CAMBIO CRÍTICO: Usamos la DB que crea Docker por defecto o variable de entorno
                database: process.env.DB_NAME || 'vinculacion_db',
                autoLoadEntities: true,
                synchronize: true,
            }),
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User]),
            // 2. JWT (INTACTO)
            jwt_1.JwtModule.register({
                secret: 'SECRET_KEY_TESIS',
                signOptions: { expiresIn: '1d' },
            }),
            // 3. Cliente RabbitMQ (DINÁMICO)
            microservices_1.ClientsModule.register([
                {
                    name: 'AUDIT_SERVICE',
                    transport: microservices_1.Transport.RMQ,
                    options: {
                        // ⚠️ CAMBIO CRÍTICO: Inyectamos el host dinámicamente
                        // Si estás en Docker usa 'uce_rabbitmq', si estás local usa 'localhost'
                        urls: [`amqp://admin:adminpassword@${process.env.RABBIT_HOST || 'localhost'}:5672`],
                        queue: 'audit_queue',
                        queueOptions: { durable: false },
                    },
                },
            ]),
            // ✅ 4. CONFIGURACIÓN RATE LIMIT (Anti-Fuerza Bruta)
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000, // 1 minuto
                    limit: 10, // Máximo 10 intentos de login/registro por IP
                }]),
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            // ✅ ACTIVAR GUARDIÁN GLOBAL
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

module.exports = require("@nestjs/typeorm");

/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("@nestjs/microservices");

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.User = void 0;
const tslib_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(8);
let User = class User {
};
exports.User = User;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    tslib_1.__metadata("design:type", Number)
], User.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "username", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], User.prototype, "password", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], User.prototype, "role", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "fullName", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "faculty", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "career", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "semester", void 0);
exports.User = User = tslib_1.__decorate([
    (0, typeorm_1.Entity)()
], User);


/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("typeorm");

/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(4);
const app_service_1 = __webpack_require__(10);
// CAMBIO CRÍTICO: Dejamos el Controller VACÍO.
// El servicio escuchará directamente en /login y /register
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    async login(body) {
        console.log("📨 Petición recibida desde Frontend:", body);
        // 1. Validar credenciales
        const user = await this.appService.validateUser(body.username, body.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        // 2. Generar Token
        return this.appService.login(user);
    }
    async register(body) {
        return await this.appService.register(body);
    }
    async getProfile(username) {
        const user = await this.appService.getUser(username);
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        // Quitamos la contraseña antes de enviarlo
        const { password, ...result } = user;
        return result;
    }
};
exports.AppController = AppController;
tslib_1.__decorate([
    (0, common_1.Post)('login'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "login", null);
tslib_1.__decorate([
    (0, common_1.Post)('register'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "register", null);
tslib_1.__decorate([
    (0, common_1.Get)('profile/:username'),
    tslib_1.__param(0, (0, common_1.Param)('username')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "getProfile", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, common_1.Controller)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(4); // <--- Agregamos Inject
const typeorm_1 = __webpack_require__(5);
const typeorm_2 = __webpack_require__(8);
const user_entity_1 = __webpack_require__(7);
const jwt_1 = __webpack_require__(11);
const microservices_1 = __webpack_require__(6); // <--- Importante para RabbitMQ
let AppService = class AppService {
    constructor(userRepo, jwtService, auditClient) {
        this.userRepo = userRepo;
        this.jwtService = jwtService;
        this.auditClient = auditClient;
    }
    // 1. SEMILLA DE DATOS (INTACTO)
    async onModuleInit() {
        console.log('🌱 Iniciando Siembra de Datos (Seeding)...');
        // Admin
        await this.seedUser({
            username: 'admin',
            password: 'admin123',
            role: 'ADMIN',
            fullName: 'Super Administrador',
            email: 'admin@uce.edu.ec',
            phone: '0999999999',
            address: 'Quito Norte',
            faculty: 'DTIC',
            career: 'Sistemas'
        });
        // Coordinador
        await this.seedUser({
            username: 'coordinador',
            password: 'coord123',
            role: 'COORDINATOR',
            fullName: 'Ing. Carlos Coordinador',
            email: 'coord@uce.edu.ec',
            phone: '0988888888',
            address: 'Centro Histórico',
            faculty: 'Vinculación General',
            career: 'Todas'
        });
        // Tutor
        await this.seedUser({
            username: 'tutor',
            password: 'tutor123',
            role: 'TUTOR',
            fullName: 'Dr. Juan Docente',
            email: 'jdocente@uce.edu.ec',
            phone: '0977777777',
            address: 'Cumbayá',
            faculty: 'Ingeniería y Ciencias Aplicadas',
            career: 'Sistemas de Información'
        });
        // Estudiante
        await this.seedUser({
            username: '1720000001',
            password: '123',
            role: 'STUDENT',
            fullName: 'Juan Fernando Pérez',
            email: 'jperez@uce.edu.ec',
            phone: '0966666666',
            address: 'Carcelén',
            faculty: 'Ingeniería y Ciencias Aplicadas',
            career: 'Sistemas de Información'
        });
        console.log('✅ Base de datos actualizada con usuarios nuevos.');
    }
    async seedUser(data) {
        const exists = await this.userRepo.findOneBy({ username: data.username });
        if (!exists) {
            const newUser = this.userRepo.create(data);
            await this.userRepo.save(newUser);
            console.log(`👤 Usuario creado: ${data.username} (${data.role})`);
        }
    }
    // 2. VALIDACIÓN (INTACTO)
    async validateUser(username, pass) {
        console.log(`🔍 INTENTO LOGIN: Buscando usuario '${username}'...`);
        const user = await this.userRepo.findOneBy({ username });
        if (!user) {
            console.log("❌ Usuario NO encontrado.");
            return null;
        }
        if (user.password === pass) {
            console.log("✅ ¡Contraseña CORRECTA!");
            const { password, ...result } = user;
            return result;
        }
        console.log("❌ Contraseña INCORRECTA.");
        return null;
    }
    // 3. LOGIN (AQUÍ ESTÁ LA MAGIA)
    async login(user) {
        // Generar Token
        const payload = { username: user.username, sub: user.id, role: user.role };
        // --- ENVIAR LOG DE AUDITORÍA A REDIS ---
        // Esto envía un mensaje a la cola 'audit_queue' sin detener el login
        this.auditClient.emit('audit_log', {
            user: user.username,
            action: 'LOGIN_EXITOSO',
            role: user.role,
            timestamp: new Date(),
            details: 'Inicio de sesión vía Auth Service'
        });
        console.log(`📡 Evento de auditoría enviado para: ${user.username}`);
        // ---------------------------------------
        return {
            access_token: this.jwtService.sign(payload),
            role: user.role,
            username: user.username
        };
    }
    // 4. REGISTRO (INTACTO)
    async register(body) {
        const existing = await this.userRepo.findOneBy({ username: body.username });
        if (existing)
            return { message: 'El usuario ya existe', success: false };
        let finalPassword = body.password;
        if (!finalPassword || finalPassword.trim() === '') {
            finalPassword = body.username;
        }
        console.log(`🛠️ Creando usuario: ${body.username} | Pass asignada: ${finalPassword}`);
        const newUser = this.userRepo.create({
            username: body.username,
            password: finalPassword,
            role: body.role || 'STUDENT',
            fullName: body.fullName,
            email: body.email,
            phone: body.phone,
            address: body.address || body.barrio || body.sector,
            faculty: body.faculty,
            career: body.career,
            semester: body.semester
        });
        try {
            await this.userRepo.save(newUser);
            // OPCIONAL: También puedes auditar el registro de usuarios
            this.auditClient.emit('audit_log', {
                user: 'SISTEMA',
                action: 'NUEVO_USUARIO',
                details: `Se registró el usuario ${body.username}`
            });
            return { message: 'Usuario creado con éxito', success: true };
        }
        catch (error) {
            console.error("Error al guardar usuario:", error);
            return { message: 'Error al guardar en base de datos', success: false };
        }
    }
    async getUser(username) {
        return this.userRepo.findOneBy({ username });
    }
};
exports.AppService = AppService;
exports.AppService = AppService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    tslib_1.__param(2, (0, common_1.Inject)('AUDIT_SERVICE')),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _b : Object, typeof (_c = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _c : Object])
], AppService);


/***/ }),
/* 11 */
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),
/* 12 */
/***/ ((module) => {

module.exports = require("@nestjs/throttler");

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
const core_1 = __webpack_require__(1);
const app_module_1 = __webpack_require__(2);
// ✅ IMPORTAR LIBRERÍAS
const common_1 = __webpack_require__(4);
const swagger_1 = __webpack_require__(13);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // 1. CORS (Permitir acceso desde Frontend)
    app.enableCors({ origin: '*' });
    // ✅ 2. ACTIVAR VALIDACIÓN GLOBAL (Seguridad de datos)
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true, // Elimina datos extra que no estén en el DTO
        forbidNonWhitelisted: true, // Error si envían campos basura
    }));
    // ✅ 3. ACTIVAR SWAGGER (Documentación)
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Auth Service')
        .setDescription('Microservicio de Autenticación (JWT + Usuarios)')
        .setVersion('1.0')
        .addBearerAuth() // Para probar endpoints protegidos si los tuvieras
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    await app.listen(3000);
    console.log(`🚀 AUTH SERVICE listo en: http://localhost:3000`);
    console.log(`📄 Docs: http://localhost:3000/api/docs`);
}
bootstrap();

})();

/******/ })()
;