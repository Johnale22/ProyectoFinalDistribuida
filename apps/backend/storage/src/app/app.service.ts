import { Injectable, OnModuleInit } from '@nestjs/common';
import { 
  S3Client, 
  PutObjectCommand, 
  CreateBucketCommand, 
  HeadBucketCommand, 
  PutBucketPolicyCommand 
} from '@aws-sdk/client-s3';

@Injectable()
export class AppService implements OnModuleInit {
  private s3: S3Client;
  private BUCKET_NAME = 'vinculacion-docs';

  constructor() {
    // Configuración para MinIO
    this.s3 = new S3Client({
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
      await this.s3.send(new HeadBucketCommand({ Bucket: this.BUCKET_NAME }));
      console.log(`✅ Bucket '${this.BUCKET_NAME}' ya existe.`);
    } catch (error) {
      // Si falla (error 404), es porque no existe -> Lo creamos
      console.log(`⚠️ El bucket no existe. Creando '${this.BUCKET_NAME}'...`);
      try {
        await this.s3.send(new CreateBucketCommand({ Bucket: this.BUCKET_NAME }));
        console.log(`📂 Bucket creado exitosamente.`);
      } catch (createError) {
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
      await this.s3.send(new PutBucketPolicyCommand({
        Bucket: this.BUCKET_NAME,
        Policy: JSON.stringify(policy)
      }));
      console.log("🌍 Bucket configurado como PÚBLICO automáticamente.");
    } catch (policyError) {
      console.error("❌ Error aplicando política pública:", policyError);
    }
  }

  async uploadFile(file: Express.Multer.File, studentId: string) {
    // Usamos timestamp para evitar nombres duplicados
    const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    const key = `uploads/${studentId}/${fileName}`;

    try {
      await this.s3.send(new PutObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: key,
        Body: file.buffer, // <--- Importante: Multer debe darnos el buffer
        ContentType: file.mimetype,
      }));

      // Generamos la URL pública
      const fileUrl = `http://localhost:9000/${this.BUCKET_NAME}/${key}`;
      return { success: true, url: fileUrl, message: 'Archivo subido correctamente' };
    } catch (error) {
      console.error("Error subiendo a S3:", error);
      return { success: false, message: 'Error al subir archivo' };
    }
  }
}