import { Module } from '@nestjs/common';
import { PrismaService } from '_config/services';
import { UsersService } from '_common/users';
import { OtpService } from '_common/otp/otp.service';
import { OtpController } from '_common/otp/otp.controller';
import { KeycloakModule } from '../../keycloak/keycloak.module';
import { MailModule } from '_common/mail/mail.module';
import { OtpMarkedUsedCronServiceService } from '_common/otp/otp-marked-used.service';
import { OtpCleanupCronService } from '_common/otp/otp-cleanup.service';

@Module({
  imports: [KeycloakModule, MailModule],
  providers: [
    PrismaService,
    UsersService,
    OtpService,
    OtpMarkedUsedCronServiceService,
    OtpCleanupCronService,
  ],
  controllers: [OtpController],
  exports: [OtpService],
})
export class OtpModule {}
