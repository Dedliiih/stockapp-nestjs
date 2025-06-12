import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Stock App API')
  .setDescription('The stock app API description')
  .setVersion('1.0')
  .addTag('Products', 'Operaciones relacionadas con los productos')
  .addTag('Auth', 'Autenticación de usuarios')
  .addBearerAuth()
  .addGlobalResponse(
    {
      status: 500,
      description: 'Error de carácter interno'
    },
    {
      status: 403,
      description: 'Recurso prohibido. Los niveles de autorización no son suficientes para acceder a este recurso.'
    },
    {
      status: 401,
      description: 'No autorizado. Se requiere una credencial válida para acceder a este recurso.'
    }
  )
  .build();
