import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { KeycloakService } from 'src/modules/keycloak/keycloak.service';
import { PrismaService } from '_config/services';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, PrismaService, KeycloakService],
  exports: [CategoryService],
})
export class CategoryModule {}
