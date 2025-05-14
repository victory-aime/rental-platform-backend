import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as figlet from 'figlet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:8070'], // List of allowed origins
    credentials: true, // ✅ Permet l'envoi et la réception des cookies
    allowedHeaders: ['Content-Type', 'Authorization', 'x-device'], // ✅ Autorise ces en-têtes
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // ✅ Autorise ces méthodes
  });
  await app.listen(4000, async () => {
    figlet('2025 - Rental Platfrom ', (_, data) => {
      console.log('\x1b[1m\x1b[32m%s\x1b[0m', data);
      figlet('Powered By VICTORY', { font: 'Small' }, (a, res) =>
        console.log('\x1b[35m%s\x1b[0m', res),
      );
    });
  });
}
bootstrap();
