import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { OtpModule } from '_common/otp/otp.module';
import { UsersModule } from '_common/users';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('GMAIL_HOST'),
          port: Number(configService.get<string>('GMAIL_PORT')),
          secure: false,
          auth: {
            user: configService.get<string>('GMAIL_CLIENT_EMAIL'),
            pass: configService.get<string>('GMAIL_CLIENT_PASSWORD'),
          },
        },
      }),
    }),
    OtpModule,
    UsersModule,
  ],
})
export class CommonModule {}
