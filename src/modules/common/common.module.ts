import { Module } from '@nestjs/common';
import { OtpModule } from '_common/otp/otp.module';
import { UsersModule } from '_common/users';

@Module({
  imports: [OtpModule, UsersModule],
})
export class CommonModule {}
