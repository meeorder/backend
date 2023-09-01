import { LoginDto } from '@/auth/dto/login.dto';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { AuthService } from './auth.service';

@Controller({ path: 'auth', version: '1' })
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('login')
  async signIn(
    @Body() signInDto: LoginDto,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    const token = await this.authService.signIn(
      signInDto.username,
      signInDto.password,
    );
    response.setCookie('jwt-meeorder', 'Bearer ' + token);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  signOut(@Res({ passthrough: true }) response: FastifyReply) {
    response.clearCookie('jwt-meeorder');
  }
}
