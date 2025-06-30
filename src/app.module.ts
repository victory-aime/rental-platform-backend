import { Module } from '@nestjs/common';
import * as winston from 'winston';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import { KeycloakModule } from './modules/keycloak/keycloak.module';
import { CarModules } from './modules/cars-agency/cars.module';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '_common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV || 'local'}`],
      isGlobal: true,
    }),
    WinstonModule.forRoot({
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
    }),
    CommonModule,
    KeycloakModule,
    CarModules,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
