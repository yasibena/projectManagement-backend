import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

const AUTH_COOKIE_NAME = 'access_token';

export interface JwtPayload {
  sub: string;
  email: string;
  role: 'user' | 'admin';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: { cookies?: Record<string, string> }) =>
          request?.cookies?.[AUTH_COOKIE_NAME] ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}
