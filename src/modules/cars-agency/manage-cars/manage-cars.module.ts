import { Module } from "@nestjs/common";
import { ManageCarService } from "./manage-cars.service";
import { KeycloakService } from "src/modules/keycloak/keycloak.service";
import { PrismaService } from "_config/services";


@Module({
    imports:[], 
    providers:[ManageCarService,KeycloakService, PrismaService],
    exports:[ManageCarService]
})

export class ManageCarModule {}