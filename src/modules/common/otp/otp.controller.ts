import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { OtpService } from '_common/otp/otp.service';
import { COMMON_API_URL } from '_config/endpoints/api';

@Controller(COMMON_API_URL.OTP.GLOBAL_ROUTES)
export class OtpController {
  constructor(private otpService: OtpService) {}

  @Post(COMMON_API_URL.OTP.GENERATE)
  @HttpCode(HttpStatus.CREATED)
  async generateOTP(@Body() data: { email: string }) {
    return await this.otpService.generateOtp(data.email);
  }

  @Post(COMMON_API_URL.OTP.VALIDATE)
  async verifyOTP(@Body() data: { email: string; otp: string }) {
    console.log('values', data);
    return await this.otpService.validateOtp(data.email, data.otp);
  }
}
