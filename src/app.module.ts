import { Module } from '@nestjs/common';
import * as winston from 'winston';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import { KeycloakModule } from './modules/keycloak/keycloak.module';
import { UsersModule } from './modules/common/users';


@Module({
  imports: [ WinstonModule.forRoot({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          nestWinstonModuleUtilities.format.nestLike('Rental-Platform', {
            colors: true,
            prettyPrint: true,
            processId: true,
            appName: true,
          }),
        ),
      }),
    ],
  }),UsersModule, KeycloakModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
