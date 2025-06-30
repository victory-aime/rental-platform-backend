import { Module } from '@nestjs/common';
import { PrismaService } from '_config/services';
import { UsersService } from '_common/users';
import { OtpService } from '_common/otp/otp.service';
import { OtpController } from '_common/otp/otp.controller';
import { EmailService } from '_common/mail/mail.service';
import { KeycloakModule } from '../../keycloak/keycloak.module';

@Module({
  imports: [KeycloakModule],
  providers: [PrismaService, UsersService, OtpService, EmailService],
  controllers: [OtpController],
  exports: [OtpService],
})
export class OtpModule {}
