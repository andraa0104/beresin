import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: any) => {
          const auth = req?.headers?.authorization;
          if (auth) {
            // Automatically clean up multiple 'bearer' or 'Bearer' prefixes
            return auth.replace(/^(Bearer\s+)+/gi, '').trim();
          }
          return null;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret', 'beresin_super_secret_jwt_key_2026'),
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      uuid: payload.uuid,
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      roles: payload.roles || ['CUSTOMER'],
    };
  }
}
