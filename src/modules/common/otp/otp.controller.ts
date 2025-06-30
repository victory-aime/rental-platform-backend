import { Body, Controller, Post } from '@nestjs/common';
import { OtpService } from '_common/otp/otp.service';
import { COMMON_API_URL } from '_config/endpoints/api';

@Controller(COMMON_API_URL.OTP.GLOBAL_ROUTES)
export class OtpController {
  constructor(private otpService: OtpService) {}

  @Post(COMMON_API_URL.OTP.GENERATE)
  async generateOTP(@Body() email: string) {
    return await this.otpService.generateOTP(email);
  }

  @Post(COMMON_API_URL.OTP.RENEW)
  async renewOtp(@Body() email: string) {
    return await this.otpService.renewOTP(email);
  }
  @Post(COMMON_API_URL.OTP.VALIDATE)
  async verifyOTP(@Body() data: { email: string; otp: string }) {
    return await this.otpService.validateOTP(data.email, data.otp);
  }
}
