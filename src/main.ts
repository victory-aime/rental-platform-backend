import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as figlet from 'figlet';
import * as bodyParser from 'body-parser';
import { LoadEnvironmentVariables } from '_config/utils/env';

async function bootstrap() {
  LoadEnvironmentVariables();
  const app = await NestFactory.create(AppModule);
  const PORT = 4000;

  app.enableCors({
    origin: ['http://localhost:8070'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-device'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  });
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  await app.listen(PORT, async () => {
    figlet('2025 - Rental Platfrom ', (_, data) => {
      console.log('\x1b[1m\x1b[32m%s\x1b[0m', data);
      figlet('Powered By VICTORY', { font: 'Small' }, (a, res) =>
        console.log('\x1b[35m%s\x1b[0m', res),
      );
    });
  });
}
bootstrap();
