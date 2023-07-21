import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // global prefix
  app.setGlobalPrefix('api/v1');
  //handle cors
  app.enableCors();
  await app.listen(4000);
}
bootstrap();
