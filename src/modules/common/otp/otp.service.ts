import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import { EmailService } from '_common/mail/mail.service';
import { UsersService } from '_common/users';
import { PrismaService } from '_config/services';
import { formatRemainingTime } from '_common/mail/utils/remaining-time';

@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly userService: UsersService,
  ) {}

  private verifyOTP(secret: string, otp: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: otp,
      window: 2,
      step: 60,
    });
  }

  async generateOTP(email: string): Promise<string> {
    const { user } = await this.userService.findUser(email);
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const otpSecret = speakeasy.generateSecret({ length: 20 });

    const otp = speakeasy.totp({
      secret: otpSecret.base32,
      encoding: 'base32',
      digits: 6,
    });

    await this.prisma.otpPolicy.upsert({
      where: { userId: user.id },
      update: {
        secret: otpSecret.base32,
        attemptCount: 0,
        isBlocked: false,
        blockUntil: null,
      },
      create: {
        userId: user.id,
        secret: otpSecret.base32,
      },
    });

    await this.sendOTPByEmail(user.email, otp);
    return otp;
  }

  async renewOTP(email: string): Promise<string> {
    const { user } = await this.userService.findUser(email);

    const policy = await this.prisma.otpPolicy.findUnique({
      where: { userId: user?.id },
    });
    if (!policy) throw new NotFoundException('OTP non généré');

    if (
      policy.isBlocked &&
      policy.blockUntil &&
      new Date() < policy.blockUntil
    ) {
      const retry = formatRemainingTime(policy.blockUntil);
      throw new UnauthorizedException({
        message: retry.message,
        retryAfter: retry.seconds,
      });
    }

    return await this.generateOTP(email);
  }

  async validateOTP(email: string, otp: string): Promise<{ message: string }> {
    const { user } = await this.userService.findUser(email);
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const policy = await this.prisma.otpPolicy.findUnique({
      where: { userId: user.id },
    });
    if (!policy) throw new NotFoundException('OTP non trouvé');

    if (
      policy.isBlocked &&
      policy.blockUntil &&
      new Date() < policy.blockUntil
    ) {
      const retry = formatRemainingTime(policy.blockUntil);
      throw new UnauthorizedException({
        message: retry.message,
        retryAfter: retry.seconds,
      });
    }

    const isValid = this.verifyOTP(policy.secret, otp);

    if (!isValid) {
      const newAttempts = policy.attemptCount + 1;
      const isNowBlocked = newAttempts >= policy.limit;
      const blockDuration = 5 * 60 * 1000; // 5 minutes

      await this.prisma.otpPolicy.update({
        where: { userId: user.id },
        data: {
          attemptCount: newAttempts,
          isBlocked: isNowBlocked,
          blockUntil: isNowBlocked
            ? new Date(Date.now() + blockDuration)
            : null,
        },
      });

      if (isNowBlocked) {
        const retry = formatRemainingTime(new Date(Date.now() + blockDuration));
        throw new UnauthorizedException({
          message: retry.message,
          retryAfter: retry.seconds,
        });
      }

      throw new UnauthorizedException('OTP invalide');
    }

    await this.prisma.otpPolicy.update({
      where: { userId: user.id },
      data: {
        attemptCount: 0,
        isBlocked: false,
        blockUntil: null,
      },
    });

    return { message: 'OTP validé avec succès' };
  }

  private async sendOTPByEmail(email: string, otp: string): Promise<void> {
    await this.emailService.sendEmail({ email, otp });
  }
}
