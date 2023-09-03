import { UserJwt } from '@/auth/user.jwt.payload';
import { Role } from '@/decorator/roles.decorator';
import { FastifyContext } from '@/utils/fastify-context';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { FastifyRequest } from 'fastify';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<FastifyRequest>();
    const token = /Bearer (.*)/.exec(req.headers.authorization)?.[1];
    const role = this.reflector.get(Role, context.getHandler());
    let decoded: UserJwt;
    try {
      decoded = await this.jwtService
        .verifyAsync(token)
        .then(UserJwt.fromDecode);
    } catch (e) {
      this.logger.error(e);
    }

    new FastifyContext(req).set('user', decoded);

    if (!role) {
      return true;
    }
    if (!decoded) {
      throw new UnauthorizedException({ message: 'Unauthorized' });
    }

    return decoded.isHavePermission(role);
  }
}
