import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { 
  S3Client, 
  PutObjectCommand, 
  CreateBucketCommand, 
  HeadBucketCommand, 
  PutBucketPolicyCommand 
} from '@aws-sdk/client-s3';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService implements OnModuleInit {
  private s3: S3Client;
  private BUCKET_NAME = 'vinculacion-docs';

  constructor(
    @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy,
  ) {
    // ✅ Leemos el endpoint desde Docker (será 'uceminio')
    const minioHost = process.env.MINIO_ENDPOINT || 'localhost';
    
    this.s3 = new S3Client({
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
      await this.s3.send(new HeadBucketCommand({ Bucket: this.BUCKET_NAME }));
      console.log(`✅ Bucket '${this.BUCKET_NAME}' verificado.`);
    } catch (error) {
      console.log(`⚠️ Bucket no encontrado. Creando '${this.BUCKET_NAME}'...`);
      try {
        await this.s3.send(new CreateBucketCommand({ Bucket: this.BUCKET_NAME }));
        console.log(`📂 Bucket creado exitosamente.`);
      } catch (createError) {
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
      await this.s3.send(new PutBucketPolicyCommand({
        Bucket: this.BUCKET_NAME,
        Policy: JSON.stringify(policy)
      }));
      console.log("🌍 Bucket configurado como PÚBLICO.");
    } catch (policyError) {
      // Ignorar si ya existe
    }
  }

  async uploadFile(file: Express.Multer.File, studentId: string) {
    // Limpiamos el nombre del archivo
    const safeName = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '');
    const fileName = `${Date.now()}-${safeName}`;
    const key = `uploads/${studentId}/${fileName}`;

    try {
      await this.s3.send(new PutObjectCommand({
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
    } catch (error) {
      console.error("❌ Error subiendo a S3:", error);
      return { success: false, message: 'Error interno al subir archivo' };
    }
  }
}